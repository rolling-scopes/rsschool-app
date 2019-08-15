import axios from 'axios';
import Link from 'next/link';
import * as React from 'react';
import { Button, Form, FormGroup, Input, InputGroup, InputGroupAddon, ListGroup, ListGroupItem } from 'reactstrap';
import { Header } from 'components/Header';
import { GithubAvatar } from 'components/UserSelect';
import withSession, { Session } from 'components/withSession';

import '../../index.scss';

type Props = {
  session: Session;
};

type State = {
  users: any[];
  searchText: string;
};

class Users extends React.Component<Props, State> {
  state: State = {
    users: [],
    searchText: '',
  };

  doSearch = async (event: any) => {
    event.preventDefault();
    if (!this.state.searchText) {
      return;
    }
    const response = await axios.get(`/api/users/search/${this.state.searchText}`);
    const users = response.data.data;
    this.setState({ users });
  };

  render() {
    return (
      <>
        <Header username={this.props.session.githubId} />
        <div className="m-5">
          <h3>Search Users</h3>
          <Form onSubmit={this.doSearch}>
            <FormGroup>
              <InputGroup>
                <Input
                  onChange={e => {
                    this.setState({ searchText: e.target.value });
                  }}
                  placeholder="search text ..."
                />
                <InputGroupAddon addonType="append">
                  <Button color="primary">Search</Button>
                </InputGroupAddon>
              </InputGroup>
            </FormGroup>
          </Form>
          {this.state.users && (
            <ListGroup>
              {this.state.users.map(user => (
                <ListGroupItem key={user.githubId}>
                  <GithubAvatar githubId={user.githubId} />
                  <Link href={{ pathname: '/profile', query: { githubId: user.githubId } }}>
                    <a>
                      {user.githubId} ({user.firstName} {user.lastName})
                    </a>
                  </Link>
                </ListGroupItem>
              ))}
            </ListGroup>
          )}
        </div>
      </>
    );
  }
}

export default withSession(Users);
