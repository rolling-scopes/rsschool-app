class Link<T> {
  public next: Link<T> | null;
  public value: T | null;

  constructor(value: T, next: Link<T> | null = null) {
    this.next = next;
    this.value = value;
  }
}

export class Queue<T> {
  public current: T | null;
  private head: Link<T> | null;
  private tail: Link<T> | null;

  constructor() {
    this.current = null;
    this.head = null;
    this.tail = null;
  }

  public add(value: T) {
    if (this.head === null) {
      this.head = new Link(value);
      this.tail = this.head;
    } else {
      this.tail!.next = new Link(value);
      this.tail = this.tail!.next;
    }
  }

  public get() {
    const value = this.head?.value;

    if (value != null) {
      this.current = value;
    }

    return value;
  }

  public remove() {
    if (this.head) {
      this.head = this.head.next;

      if (this.head === null) {
        this.tail = this.head;
      }

      this.current = null;
    }
  }
}

// [1]<-[2]<-[3]<-[4]

// 1 => next: 2, prev: null; // head
// 2 => next: 3, prev: 1;
// 3 => next: null, prev: 2; // tail


// q.get():
//    q.head.value
// q.remove():
//    q.head = q.head.next
// q.add():
//    q.tail.next = new Link()
//    q.tail = q.tail.next

// create queue
// setInterval 2000 sec - and check queue
