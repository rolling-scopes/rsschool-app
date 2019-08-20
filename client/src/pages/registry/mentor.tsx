import * as React from 'react';
import axios from 'axios';

import { Alert, Button, Container, FormGroup, Input, Label, Row } from 'reactstrap';
import { Form } from 'react-final-form';
import Select from 'react-select';

import { Header } from 'components/Header';
import InputField from 'components/Registry/InputField';
import DropdownField from 'components/Registry/DropdownField';

import withCourses from 'components/withCourses';
import withSession from 'components/withSession';

import { TYPES, Props, SelectCourse, citiesOptions } from './../../configs/registry';
import { Course } from 'services/course';

type State = {
  selectedCourse: SelectCourse;
  courses: SelectCourse[];
  submitted: boolean;
  isAgree: boolean;
};

class CourseRegistryPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const courses: SelectCourse[] = (this.props.courses || [])
      .filter((course: Course) => course.planned)
      .map((course: Course): SelectCourse => ({ label: course.name, value: course.id }));

    this.state = {
      selectedCourse: courses[0],
      courses,
      submitted: false,
      isAgree: false,
    };
  };

  private changeCourse = (course: any) => {
    this.setState({ selectedCourse: course });
  };

  private changeIsAgree = (e: any) => {
    this.setState({isAgree: e.target.checked})
  };

  private handleSubmit = async (model: any) => {
    const { selectedCourse: course } = this.state;
    const { comment, locationName } = model;
    const registryModel = {
      type: TYPES.MENTOR,
      courseId: course.value,
      comment,
    };
    const userModel = {
      firstName: model.firstName,
      lastName: model.lastName,
      locationName: locationName === 'other' ? model.otherLocationName : locationName,
      contactsEmail: model.contactsEmail,
      contactsEpamEmail: model.contactsEpamEmail,
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
      this.setState({ submitted: true });
    } catch (e) {
      console.error(e);
    }
  };

  render() {
    if (!this.props.session) {
      return null;
    }

    const { selectedCourse, courses, isAgree } = this.state;

    return (
      <div>
        <Header username={this.props.session.githubId} />
        {!selectedCourse && <Alert color="warning">There are no planned courses</Alert>}
        {selectedCourse && (
          <Container>
            <FormGroup>
              <h3>Course Registry (mentor)</h3>
            </FormGroup>
            {
              this.state.submitted ? <Alert color="info">Registration has been submitted</Alert> : (
              <>
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

                <Form
                  onSubmit={this.handleSubmit}
                  render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                      <Row className="align-items-center">
                        <InputField name="firstName" label="First Name" />
                        <InputField name="lastName" label="Last Name" />
                      </Row>
                      <Row className="align-items-center">
                        <DropdownField name="locationName" label="LocationName" options={citiesOptions} />
                        <InputField name="otherLocationName" label="Location Name (If Other)" isRequired={false} />
                      </Row>
                      <Row className="align-items-center">
                        <InputField name="contactsEmail" label="Contacts E-mail" type="email" />
                        <InputField name="contactsEpamEmail" label="Contacts EPAM E-mail" type="email" isRequired={false} />
                      </Row>
                      <Row className="align-items-center">
                        <Container>
                          <h5>Employment History</h5>
                          <Row className="align-items-center">
                            <InputField name="title" label="Title" />
                            <InputField name="toPresent" label="Is Present" type="checkbox" isRequired={false} />
                          </Row>
                          <Row className="align-items-center">
                            <InputField name="dateFrom" label="From" />
                            <InputField name="dateTo" label="To" isRequired={false} />
                          </Row>
                          <Row className="align-items-center">
                            <InputField name="companyName" label="Company Name" />
                          </Row>
                        </Container>
                      </Row>
                      <Row className="align-items-center">
                        <InputField name="comment" label="Comment" type="textarea" isRequired={false} />
                      </Row>
                      <Row className="align-items-center">
                        <FormGroup className="col-md">
                          <div className="form-check">
                            <Input type="checkbox" checked={isAgree} id="gdpr" onChange={this.changeIsAgree} />
                            <Label check for="gdpr">GDPR checkbox</Label>
                          </div>
                        </FormGroup>
                        <FormGroup className="col-md">
                          <Button type="submit" color="success" disabled={!isAgree}>
                            Submit
                          </Button>
                        </FormGroup>
                      </Row>
                    </form>
                  )}
                />
              </>
            )}
          </Container>
        )}
      </div>
    );
  }
}

export default withCourses(withSession(CourseRegistryPage));
