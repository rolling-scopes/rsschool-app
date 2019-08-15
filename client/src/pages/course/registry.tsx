import * as React from 'react';
import axios from 'axios';

import { Alert, Button, ButtonGroup, Container, FormGroup, Row } from 'reactstrap';
import { Form } from 'react-final-form';
import Select from 'react-select';

import { Header } from 'components/Header';
import InputField from 'components/Registry/InputField';
import DropdownField from 'components/Registry/DropdownField';

import withCourses from 'components/withCourses';
import withSession, { Session } from 'components/withSession';

import { CITIES } from 'services/reference-data';
import { Course } from 'services/course';

const TYPES = {
  MENTOR: 'mentor',
  STUDENT: 'student',
};

type Props = {
  courses?: Course[];
  session?: Session;
};

type SelectCourse = {
  label?: string;
  value?: number;
};

type State = {
  selectedCourse: SelectCourse;
  courses: SelectCourse[];
  type: string;
  submitted: boolean;
};

const citiesOptions = [{ id: '', name: '(Empty)' }].concat(CITIES).map(city => ({ label: city.name, value: city.id }));

class CourseRegistryPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const courses: SelectCourse[] = (this.props.courses || [])
      .filter((course: Course) => course.planned)
      .map((course: Course): SelectCourse => ({ label: course.name, value: course.id }));

    this.state = {
      selectedCourse: courses[0],
      courses,
      type: TYPES.STUDENT,
      submitted: false,
    };
  }

  private changeType = (event: React.MouseEvent) => {
    const id = (event.target as Element).id;
    this.setState({ type: id });
  };

  private changeCourse = (course: any) => {
    this.setState({ selectedCourse: course });
  };

  private getButtonClass = (buttonId: string) => (this.state.type === buttonId ? 'success' : 'secondary');

  private handleSubmit = async (model: any) => {
    const { type, selectedCourse: course } = this.state;
    const { comment, locationName } = model;
    const registryModel = {
      type,
      courseId: course.value,
      comment,
    };
    const userModel = {
      firstName: model.firstName,
      lastName: model.lastName,
      firstNameNative: model.firstNameNative,
      lastNameNative: model.lastNameNative,
      dateOfBirth: model.dateOfBirth,
      locationName: locationName === 'other' ? model.otherLocationName : locationName,
      contactsPhone: model.contactsPhone,
      contactsEmail: model.contactsEmail,
      contactsEpamEmail: model.contactsEpamEmail,
      educationHistory: [
        {
          graduationYear: model.graduationYear,
          faculty: model.faculty,
          university: model.university,
        },
      ],
      employmentHistory: [
        {
          title: model.title,
          dateFrom: model.dateFrom,
          dateTo: model.dateTo,
          toPresent: model.toPresent,
        },
      ],
    };

    const requests = [axios.post('/api/profile/registry', userModel), axios.post('/api/registry', registryModel)];

    try {
      await Promise.all(requests);
      this.setState(
        {
          submitted: true,
        },
        () => {
          setTimeout(() => {
            this.setState({ submitted: false });
          }, 5000);
        },
      );
    } catch (e) {
      console.error(e);
    }
  };

  render() {
    if (!this.props.session) {
      return null;
    }

    const { selectedCourse, courses, type } = this.state;

    return (
      <div>
        <Header username={this.props.session.githubId} />
        {!selectedCourse && <Alert color="warning">There are no planned courses</Alert>}
        {selectedCourse && (
          <Container>
            <FormGroup>
              <h3>Course Registry</h3>
            </FormGroup>
            {this.state.submitted && <Alert color="info">Registration has been submitted</Alert>}
            <Row className="align-items-center">
              <FormGroup className="col-md-6">
                <Select
                  placeholder="Select course..."
                  value={selectedCourse}
                  options={courses}
                  onChange={this.changeCourse}
                />
              </FormGroup>
            </Row>
            <Row className="align-items-center">
              <FormGroup className="col-md-6">
                <ButtonGroup>
                  <Button
                    id={TYPES.STUDENT}
                    color={this.getButtonClass(TYPES.STUDENT)}
                    onClick={this.changeType}
                    className="border border-success"
                  >
                    Student
                  </Button>
                  <Button
                    id={TYPES.MENTOR}
                    color={this.getButtonClass(TYPES.MENTOR)}
                    onClick={this.changeType}
                    className="border border-success"
                  >
                    Mentor
                  </Button>
                </ButtonGroup>
              </FormGroup>
            </Row>

            <Form
              onSubmit={this.handleSubmit}
              render={({ handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                  <Row className="align-items-center">
                    <InputField name="firstName" label="First Name" />
                    <InputField name="lastName" label="Last Name" />
                  </Row>
                  {type === TYPES.STUDENT && (
                    <>
                      <Row className="align-items-center">
                        <InputField name="lastNameNative" label="Native Last Name" isRequired={false} />
                        <InputField name="firstNameNative" label="Native First Name" isRequired={false} />
                      </Row>
                      <Row className="align-items-center">
                        <InputField name="dateOfBirth" label="Date Of Birth" type="date" isRequired={false} />
                      </Row>
                    </>
                  )}
                  <Row className="align-items-center">
                    <DropdownField name="locationName" label="LocationName" options={citiesOptions} />
                    <InputField name="otherLocationName" label="Location Name (If Other)" isRequired={false} />
                  </Row>
                  <Row className="align-items-center">
                    <InputField name="contactsPhone" label="Contacts Phone" type="tel" />
                    <InputField name="contactsEmail" label="Contacts E-mail" type="email" />
                  </Row>
                  <Row className="align-items-center">
                    <InputField name="contactsEpamEmail" label="Contacts EPAM E-mail" type="email" isRequired={false} />
                  </Row>
                  <Row className="align-items-center">
                    {type === TYPES.STUDENT && (
                      <Container>
                        <h5>Education History</h5>
                        <Row className="align-items-center">
                          <InputField name="graduationYear" label="Graduation Year" type="number" />
                        </Row>
                        <Row className="align-items-center">
                          <InputField name="faculty" label="Faculty" />
                          <InputField name="university" label="University" />
                        </Row>
                      </Container>
                    )}
                    <Container>
                      <h5>Employment History</h5>
                      <Row className="align-items-center">
                        <InputField name="title" label="Title" isRequired={type === TYPES.MENTOR} />
                        <InputField name="toPresent" label="Is Present" type="checkbox" isRequired={false} />
                      </Row>
                      <Row className="align-items-center">
                        <InputField name="dateFrom" label="From" isRequired={type === TYPES.MENTOR} />
                        <InputField name="dateTo" label="To" isRequired={false} />
                      </Row>
                      <Row className="align-items-center">
                        <InputField name="companyName" label="Company Name" isRequired={type === TYPES.MENTOR} />
                      </Row>
                    </Container>
                  </Row>
                  <Row className="align-items-center">
                    <InputField name="comment" label="Comment" type="textarea" isRequired={false} />
                  </Row>
                  <Row className="align-items-center">
                    <FormGroup className="col-md-6">
                      <Button type="submit" color="success">
                        Submit
                      </Button>
                    </FormGroup>
                  </Row>
                </form>
              )}
            />
          </Container>
        )}
      </div>
    );
  }
}

export default withCourses(withSession(CourseRegistryPage));
