export default new (class {
  public logs :any[] = [];

  push(log: any) {
    this.logs.push(log);
  }
})();
