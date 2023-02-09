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
