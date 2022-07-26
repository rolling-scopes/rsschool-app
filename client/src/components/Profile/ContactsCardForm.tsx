import { Form, Input, List, Typography } from 'antd';
import { Contacts } from 'common/models/profile';
import { Contact } from 'services/user';

const { Text } = Typography;

type FormProps = {
  contacts: Contact[];
  setValues: React.Dispatch<React.SetStateAction<Contacts>>;
  setHasError: React.Dispatch<React.SetStateAction<boolean>>;
};

const ContactsCardForm = ({ contacts, setValues, setHasError }: FormProps) => {
  const [form] = Form.useForm();

  const handleChanges = () => {
    form.validateFields().catch(({ errorFields }) => setHasError(!!errorFields?.length));

    const values: Contacts = form.getFieldsValue();
    setValues(values);
  };

  return (
    <Form
      form={form}
      onValuesChange={handleChanges}
      initialValues={Object.fromEntries(contacts.map(c => [c.key, c.value]))}
    >
      <List<Contact>
        itemLayout="horizontal"
        dataSource={contacts}
        renderItem={({ name, key, rules }: Contact) => (
          <List.Item>
            <label style={{ width: '100%' }}>
              <Text style={{ fontSize: 18, marginBottom: 5, display: 'inline-block' }} strong>
                {name}:
              </Text>
              <Form.Item rules={rules} name={key}>
                <Input style={{ width: '100%' }} />
              </Form.Item>
            </label>
          </List.Item>
        )}
      />
    </Form>
  );
};

export default ContactsCardForm;
