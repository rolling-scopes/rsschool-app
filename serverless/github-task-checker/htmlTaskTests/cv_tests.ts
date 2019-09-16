declare const chai: any;
declare const describe: any;
declare const it: any;

module.exports.tests = ():void => {
  describe('check if exist specific ids', function () {
    it('should find header with id="name"', function () {
        let element :any = document.querySelector("#name");
        chai.assert.isNotNull(element);
    });
    it('should find header with id="contacts"', function () {
        let element :any = document.querySelector("#contacts");
        chai.assert.isNotNull(element);
    });
    it('should find header with id="summary"', function () {
        let element :any= document.querySelector("#summary");
        chai.assert.isNotNull(element);
    });
    it('should find header with id="skills"', function () {
        let element :any= document.querySelector("#skills");
        chai.assert.isNotNull(element);
    });
    it('should find header with id="experience"', function () {
        let element :any= document.querySelector("#experience");
        chai.assert.isNotNull(element);
    });
    it('should find header with id="education"', function () {
        let element :any= document.querySelector("#education");
        chai.assert.isNotNull(element);
    });
    it('should find header with id="english-level"', function () {
        let element :any= document.querySelector("#english-level");
        chai.assert.isNotNull(element);
    });
    it('should find header with id="experience"', function () {
        let element :any= document.querySelector("#experience");
        chai.assert.isNotNull(element);
    });

  });
}  

