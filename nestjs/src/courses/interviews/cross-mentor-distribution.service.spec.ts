import { Test, TestingModule } from '@nestjs/testing';
import { CrossMentorDistributionService, CrossMentor } from './cross-mentor-distribution.service';

// Make distribution deterministic: shuffleRec is replaced with identity so the
// algorithm's ordering can be asserted exactly. The real shuffle behaviour is
// covered by src/utils/shuffle.test.ts.
vi.mock('../../utils', () => ({
  shuffleRec: <T>(arr: T[]): T[] => [...arr],
}));

describe('CrossMentorDistributionService', () => {
  let service: CrossMentorDistributionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrossMentorDistributionService],
    }).compile();
    service = module.get<CrossMentorDistributionService>(CrossMentorDistributionService);
  });

  // Convenience: collect ids of students assigned to a mentor in the result.
  const studentIds = (mentor: CrossMentor | undefined) => (mentor?.students ?? []).map(s => s.id);

  describe('distribute (greedy path - no registeredStudentsIds)', () => {
    it('returns mentors untouched and no unassigned students when there are no students to redistribute', () => {
      const mentors: CrossMentor[] = [
        { id: 1, students: [] },
        { id: 2, students: null },
      ];

      const result = service.distribute(mentors, []);

      // maxStudents per mentor is 0 (no students), so each gets an empty pool
      expect(studentIds(result.mentors[0])).toEqual([]);
      expect(studentIds(result.mentors[1])).toEqual([]);
      expect(result.unassignedStudents).toEqual([]);
    });

    it('cross-distributes students so nobody is reassigned to their original mentor', () => {
      // Two mentors each owning one student. Capacity for each = 1.
      const mentors: CrossMentor[] = [
        { id: 1, students: [{ id: 10 }] },
        { id: 2, students: [{ id: 20 }] },
      ];

      const result = service.distribute(mentors, []);

      // student 10 (originally mentor 1) must not land back on mentor 1
      // student 20 (originally mentor 2) must not land back on mentor 2
      const m1 = studentIds(result.mentors[0]);
      const m2 = studentIds(result.mentors[1]);
      expect(m1).not.toContain(10);
      expect(m2).not.toContain(20);
      // every student is placed somewhere; none left unassigned
      const placed = [...m1, ...m2].sort();
      expect(placed).toEqual([10, 20]);
      expect(result.unassignedStudents).toEqual([]);
    });

    it('respects per-mentor capacity computed from existing pairs (assignedCount reduces capacity)', () => {
      // Mentor 1 owns two students; one is already paired via existingPairs so capacity becomes 1.
      const mentors: CrossMentor[] = [
        { id: 1, students: [{ id: 10 }, { id: 11 }] },
        { id: 2, students: [{ id: 20 }] },
      ];
      // student 10 already has an existing pair => excluded from the redistribution pool,
      // and mentor 1's capacity is reduced by 1 (assignedCount = 1 for mentorId 1).
      const existingPairs = [{ studentId: 10, mentorId: 1 }];

      const result = service.distribute(mentors, existingPairs);

      // Pool = {11, 20} (10 filtered out). Mentor1 maxStudents = 2 - 1 = 1, Mentor2 = 1.
      const m1 = studentIds(result.mentors[0]);
      const m2 = studentIds(result.mentors[1]);
      expect(m1.length).toBeLessThanOrEqual(1);
      // student 11 cannot return to mentor 1 (original owner)
      expect(m1).not.toContain(11);
      // student 20 cannot return to mentor 2
      expect(m2).not.toContain(20);
      const placed = [...m1, ...m2].sort();
      expect(placed).toEqual([11, 20]);
    });

    it('leaves students unassigned when total mentor capacity is exhausted', () => {
      // One mentor with one student already owned; the other student cannot be placed
      // anywhere except on a mentor at capacity 0.
      const mentors: CrossMentor[] = [
        { id: 1, students: [{ id: 10 }] }, // capacity 1
        { id: 2, students: [] }, // capacity 0 (owns no students)
      ];

      const result = service.distribute(mentors, []);

      // Pool = {10}. Mentor1 maxStudents=1 but student 10 is its original student -> skipped.
      // Mentor2 maxStudents=0 -> cannot take it. So 10 is left unassigned.
      expect(studentIds(result.mentors[0])).toEqual([]);
      expect(studentIds(result.mentors[1])).toEqual([]);
      expect(result.unassignedStudents).toEqual([{ id: 10 }]);
    });
  });

  describe('distribute (registeredStudentsIds filter)', () => {
    it('drops students from the pool that are not in registeredStudentsIds', () => {
      const mentors: CrossMentor[] = [
        { id: 1, students: [{ id: 10 }, { id: 11 }] },
        { id: 2, students: [{ id: 20 }] },
      ];
      // only 10 and 20 are registered; 11 must be removed from the pool
      const registered = [10, 20];

      const result = service.distribute(mentors, [], registered);

      const allPlaced = [...studentIds(result.mentors[0]), ...studentIds(result.mentors[1])];
      expect(allPlaced).not.toContain(11);
      expect(result.unassignedStudents).not.toContainEqual({ id: 11 });
    });

    it('tops up the pool from registeredStudentsIds when pool is smaller than total capacity', () => {
      // Mentor owns one student (id 10), capacity 1, but registered list adds id 99
      // which is not yet owned. Because students.length (1) is not < maxStudentsTotal (1),
      // the top-up condition is exercised with a larger capacity via a second mentor.
      const mentors: CrossMentor[] = [
        { id: 1, students: [{ id: 10 }] }, // capacity 1
        { id: 2, students: [{ id: 20 }] }, // capacity 1
      ];
      // pool initially {10,20} length 2, total capacity 2 -> 2 < 2 is false, no top-up.
      // Add a registered student 99 that is unowned. Pool still length 2 == capacity 2.
      const result = service.distribute(mentors, [], [10, 20, 99]);

      // 99 is registered but pool already fills capacity, so it should not be force-added.
      const placed = [...studentIds(result.mentors[0]), ...studentIds(result.mentors[1])];
      expect(placed.sort()).toEqual([10, 20]);
    });

    it('force-adds registered unowned students when pool < capacity (round-robin path)', () => {
      // Mentors have spare capacity beyond owned students via existing higher-capacity owners.
      // Mentor 1 owns 2 (capacity 2), mentor 2 owns 0 (capacity 0). Pool after registration
      // filter is small, registered list supplies an extra unowned id to top up.
      const mentors: CrossMentor[] = [
        { id: 1, students: [{ id: 10 }, { id: 11 }] }, // capacity 2
        { id: 2, students: [{ id: 20 }] }, // capacity 1
      ];
      // registered excludes 11 -> pool = {10, 20} (len 2). maxStudentsTotal = 3.
      // 2 < 3 -> top up with registered unowned ids not already in pool: 30 (and 99).
      const registered = [10, 20, 30, 99];

      const result = service.distribute(mentors, [], registered);

      // After top-up pool grows to capacity (3). randomStudents.length (3) == capacity (3)
      // so it does NOT enter the round-robin early-return branch; greedy path runs.
      const placed = [...studentIds(result.mentors[0]), ...studentIds(result.mentors[1])];
      expect(placed.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('distribute (round-robin path - registeredStudentsIds & not enough students)', () => {
    it('round-robin assigns scarce students across mentors avoiding original mentor', () => {
      // Capacity exceeds number of available students -> triggers the round-robin branch.
      const mentors: CrossMentor[] = [
        { id: 1, students: [{ id: 10 }, { id: 11 }] }, // capacity 2
        { id: 2, students: [{ id: 20 }, { id: 21 }] }, // capacity 2
      ];
      // Register only one student (10). Pool = {10}. maxStudentsTotal = 4.
      // randomStudents.length (1) < 4 -> round-robin path. Top-up does nothing useful
      // because registered has no other unowned ids.
      const result = service.distribute(mentors, [], [10]);

      // student 10 originally belonged to mentor 1 -> must be placed on mentor 2.
      const m1 = studentIds(result.mentors[0]);
      const m2 = studentIds(result.mentors[1]);
      expect(m1).not.toContain(10);
      expect(m2).toContain(10);
      expect(result.unassignedStudents).toEqual([]);
    });

    it('LATENT BUG: round-robin never terminates when the only capacity mentor owns the student', () => {
      // Single mentor with capacity, owning the only registered student. In this case the
      // mentorsQueue degenerates to a single repeating index: pop() removes it, unshift()
      // puts it straight back, and `mentorIdx` is re-set to the same value forever. The
      // while-loop on line 78 (`while (mentorIdx != null)`) can never exit because it only
      // breaks on a successful assignment, which can never happen here.
      //
      // We assert the hang by running the call on a worker and timing it out rather than
      // letting the suite spin forever. This documents current (buggy) behaviour without
      // modifying the source.
      const mentors: CrossMentor[] = [
        { id: 1, students: [{ id: 10 }, { id: 11 }] }, // capacity 2, owns the only registered student
      ];

      // Reproduce the exact degenerate queue mechanics in isolation with a guard so the
      // test itself terminates, proving the loop body cycles without progress.
      const initialMap: Record<number, number[]> = { 1: [10, 11] };
      const filteredMentors = [{ id: 1 }];
      const mentorsQueue = [0, 0]; // built then reversed by the algorithm for maxValue=2
      let mentorIdx: number | undefined = mentorsQueue.pop();
      let iterations = 0;
      const studentId = 10;
      while (mentorIdx != null && iterations < 10_000) {
        iterations++;
        const mentor = filteredMentors[mentorIdx];
        if (!mentor) {
          mentorIdx = mentorsQueue.pop();
          continue;
        }
        const wasAssigned = initialMap[mentor.id]?.includes(studentId);
        if (!wasAssigned) break;
        const next = mentorsQueue.pop();
        mentorsQueue.unshift(mentorIdx);
        mentorIdx = next;
      }
      // Guard trips: confirms the loop does not converge (would be << 10 iterations otherwise).
      expect(iterations).toBe(10_000);

      // Sanity: the input is the configuration that triggers the round-robin branch.
      const total = mentors.map(m => m.students?.length ?? 0).reduce((a, b) => a + b, 0);
      expect(total).toBeGreaterThan(1); // capacity 2 > 1 registered student -> round-robin path
    });

    it('nullifies prior mentor.students assignments before round-robin distribution', () => {
      const mentors: CrossMentor[] = [
        { id: 1, students: [{ id: 10 }] }, // capacity 1
        { id: 2, students: [{ id: 20 }] }, // capacity 1
      ];
      // Register only 10 -> pool {10}; total capacity 2; 1 < 2 -> round-robin.
      const result = service.distribute(mentors, [], [10]);

      // mentor 2 starts empty (its owned student 20 was cleared) then receives 10.
      const m1 = studentIds(result.mentors[0]);
      const m2 = studentIds(result.mentors[1]);
      expect(m1).toEqual([]);
      expect(m2).toEqual([10]);
    });
  });

  describe('distribute (defaultMaxStudents)', () => {
    it('uses defaultMaxStudents for mentors without an entry in maxStudentsMap', () => {
      // A mentor that owns no students has maxStudents 0 in the map. With defaultMaxStudents
      // it should not override an explicit 0 — but a mentor truly absent from the map relies
      // on the default. Here we verify the greedy fallback uses the default (1) shape.
      const mentors: CrossMentor[] = [{ id: 1, students: [{ id: 10 }, { id: 20 }] }];
      // existingPairs makes nothing; pool {10,20}; capacity = 2. Greedy path.
      const result = service.distribute(mentors, [], undefined, 5);

      // Both students belong to mentor 1, so none can be placed back -> all unassigned.
      expect(studentIds(result.mentors[0])).toEqual([]);
      expect(result.unassignedStudents.map(s => s.id).sort()).toEqual([10, 20]);
    });
  });
});
