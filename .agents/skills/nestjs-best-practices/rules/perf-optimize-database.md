---
title: Optimize Database Queries
impact: HIGH
impactDescription: Database queries are typically the largest source of latency
tags: performance, database, queries, optimization
---

## Optimize Database Queries

Select only needed columns, use proper indexes, avoid over-fetching relations, and consider query performance when designing your data access. Most API slowness traces back to inefficient database queries.

**Incorrect (over-fetching data and missing indexes):**

```typescript
// Select everything when you need few fields
@Injectable()
export class UsersService {
  async findAllEmails(): Promise<string[]> {
    const users = await this.repo.find();
    // Fetches ALL columns for ALL users
    return users.map((u) => u.email);
  }

  async getUserSummary(id: string): Promise<UserSummary> {
    const user = await this.repo.findOne({
      where: { id },
      relations: ['posts', 'posts.comments', 'posts.comments.author', 'followers'],
    });
    // Over-fetches massive relation tree
    return { name: user.name, postCount: user.posts.length };
  }
}

// No indexes on frequently queried columns
@Entity()
export class Order {
  @Column()
  userId: string; // No index - full table scan on every lookup

  @Column()
  status: string; // No index - slow status filtering
}
```

**Correct (select only needed data with proper indexes):**

```typescript
// Select only needed columns
@Injectable()
export class UsersService {
  async findAllEmails(): Promise<string[]> {
    const users = await this.repo.find({
      select: ['email'], // Only fetch email column
    });
    return users.map((u) => u.email);
  }

  // Use QueryBuilder for complex selections
  async getUserSummary(id: string): Promise<UserSummary> {
    return this.repo
      .createQueryBuilder('user')
      .select('user.name', 'name')
      .addSelect('COUNT(post.id)', 'postCount')
      .leftJoin('user.posts', 'post')
      .where('user.id = :id', { id })
      .groupBy('user.id')
      .getRawOne();
  }

  // Fetch relations only when needed
  async getFullProfile(id: string): Promise<User> {
    return this.repo.findOne({
      where: { id },
      relations: ['posts'], // Only immediate relation
      select: {
        id: true,
        name: true,
        email: true,
        posts: {
          id: true,
          title: true,
        },
      },
    });
  }
}

// Add indexes on frequently queried columns
@Entity()
@Index(['userId'])
@Index(['status'])
@Index(['createdAt'])
@Index(['userId', 'status']) // Composite index for common query pattern
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}

// Always paginate large datasets
@Injectable()
export class OrdersService {
  async findAll(page = 1, limit = 20): Promise<PaginatedResult<Order>> {
    const [items, total] = await this.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
```

Reference: [TypeORM Query Builder](https://typeorm.io/select-query-builder)
