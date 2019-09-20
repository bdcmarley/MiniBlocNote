import React, { Component } from "react";
import {
  Button,
  Modal,
  InputGroup,
  FormControl,
  ListGroup,
  Form
} from "react-bootstrap";
import { withFirestore } from "react-redux-firebase";
import { connect } from "react-redux";
import { compose } from "redux";
import ColorPicker from "./ColorPicker";
import moment from "moment";

class EditListModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...this.props.userNotesObject[this.props.noteID],
      listItemText: ""
    };
  }

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  listItemOnChange = (e, index) => {
    const list = [...this.state.list];
    list[index] = { ...list[index], text: e.target.value };
    this.setState({ list: [...list] });
  };

  addListItem = e => {
    e.preventDefault();
    let newListItem = {
      text: this.state.listItemText,
      isDone: false
    };

    this.setState({
      list: [...this.state.list, newListItem],
      listItemText: ""
    });
  };

  deleteListItem = index => {
    this.setState({
      list: [
        ...this.state.list.filter(
          listItem => this.state.list.indexOf(listItem) !== index
        )
      ]
    });
  };

  checkListItem = index => {
    let list = [...this.state.list];
    let listItem = this.state.list[index];
    let editedListItem = {
      text: listItem.text,
      isDone: !listItem.isDone
    };
    list[index] = editedListItem;

    this.setState({
      list: [...list]
    });
  };

  deleteNote = () => {
    const { firestore, userID, noteID } = this.props;

    firestore.delete({
      collection: "notes",
      doc: userID,
      subcollections: [{ collection: "notes", doc: noteID }]
    });
    this.close();
  };

  close = () => {
    this.props.editListModalClose();
    this.setState({
      title: this.props.userNotesObject[this.props.noteID].title,
      list: this.props.userNotesObject[this.props.noteID].list,
      color: this.props.userNotesObject[this.props.noteID].color,
      listItemText: ""
    });
  };

  saveAndClose = () => {
    let editedNote = {
      type: this.state.type,
      title: this.state.title,
      list: this.state.list,
      createdAt: this.state.createdAt,
      editedAt: Date.now(),
      pinned: this.state.pinned,
      color: this.state.color
    };
    this.props.editListModalSaveAndClose(editedNote);
    this.setState({ listItemText: "", editedAt: Date.now() });
  };

  changeColor = color => {
    this.setState({ color });
  };

  render() {
    const {
      title,
      list,
      createdAt,
      editedAt,
      color,
      listItemText
    } = this.state;

    let editedAtMoment;
    if (editedAt) {
      editedAtMoment = moment(editedAt).calendar();
    }
    let createdAtMoment = moment(createdAt).calendar();

    return (
      <div>
        <Modal
          size="lg"
          show={this.props.editListModalShow}
          onHide={this.close}
          backdrop="static"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter" />
            <InputGroup className="mb-3">
              <FormControl
                placeholder="titre"
                aria-label="titre"
                aria-describedby="basic-addon1"
                name="title"
                value={title}
                onChange={this.onChange}
              />
            </InputGroup>
          </Modal.Header>
          <Modal.Body>
            <ListGroup>
              {list.map((listItem, index) => {
                if (listItem) {
                  return (
                    <div key={index}>
                      <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                          <InputGroup.Checkbox
                            aria-label="regarde si l'element est fait"
                            onChange={() => this.checkListItem(index)}
                            checked={listItem.isDone ? true : false}
                          />
                        </InputGroup.Prepend>
                        <FormControl
                          aria-describedby="description de l'élement"
                          name="listItemText"
                          value={listItem.text}
                          disabled={listItem.isDone ? true : false}
                          onChange={e => {
                            this.listItemOnChange(e, index);
                          }}
                          key={index}
                        />
                        <InputGroup.Append>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => this.deleteListItem(index)}
                          >
                            <i className="fa fa-trash" />
                          </Button>
                        </InputGroup.Append>
                      </InputGroup>
                    </div>
                  );
                } else {
                  return null;
                }
              })}
            </ListGroup>
            <Form onSubmit={this.addListItem}>
              <InputGroup>
                <FormControl
                  aria-label="ajoute un élément ici"
                  name="listItemText"
                  placeholder="ajoute un élément ici"
                  value={listItemText}
                  onChange={this.onChange}
                  required
                />
                <InputGroup.Append>
                  <Button type="submit" variant="outline-success">
                    Ajouter Element
                  </Button>
                </InputGroup.Append>
              </InputGroup>
            </Form>
            <span className="float-right noteTimestamp">
              {editedAtMoment ? "Edited:" : "Created:"}{" "}
              {editedAtMoment ? editedAtMoment : createdAtMoment}
            </span>
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: color }}>
            <ColorPicker changeColor={this.changeColor} />
            <Button variant="dark" onClick={this.deleteNote}>
              <i className="fa fa-trash" />
            </Button>
            <Button variant="dark" onClick={this.saveAndClose}>
              Sauvegarder
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
export default compose(
  withFirestore,
  connect(state => ({
    userNotes: state.firestore.ordered.userNotes,
    userNotesObject: state.firestore.data.userNotes,
    userID: state.firebase.auth.uid
  }))
)(EditListModal);
