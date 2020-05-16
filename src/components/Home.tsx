import React, { useState, useEffect } from 'react';
import User from '../types/User'
import { List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, ListItemIcon, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@material-ui/core';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import CreateIcon from '@material-ui/icons/Create';
import DeleteIcon from '@material-ui/icons/Delete';
import { useHistory, Redirect } from 'react-router';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      width: 500,
      flexDirection: 'column',
      justifyContent: 'flex-start'
    },
    root: {
      width: '100%',
      maxWidth: 600,
      backgroundColor: theme.palette.background.paper,
    },
    btn: {
      margin: theme.spacing(2),
      flexGrow: 1,
    }
  }));

const Home = (props: any) => {
  const classes = useStyles();
  let history = useHistory();
  const loggedInEmail = (!!props.location.state) ? props.location.state.loggedInEmail : '';

  const getToken = () => {
    return !!props.location.state ? props.location.state.token : ''
  }
  const [token, setToken] = useState(getToken);
  const [users, setUsers] = useState([]);
  const [deleteUserEmail, setDeleteUserEmail] = useState('')

  useEffect(() => {
    getUsers().then((response: any) => {
      if (response.message === 'Invalid token') {
        setToken('')
      }
      setUsers(response.users)
    })
  }, [])

  

  const handleAddUser = () => {
    history.push({
      pathname: '/add-user',
      state: {
        loggedInEmail,
        token
      }
    })
  }

  const handleChangePassword = (user: User) => {
    history.push({
      pathname: '/password-reset',
      state: {
        loggedInEmail,
        user,
        token
      }
    })
  }

  const handleDeleteDialogOpen = (email: string) => {
    setDeleteUserEmail(email)
  }
  const handleDeleteDialogClose = () => {
    setDeleteUserEmail('')
  }
  const handleDeleteDialogConfirm = async () => {
    if (!!deleteUserEmail) {
      const response = await deleteUser(deleteUserEmail)
      setUsers(response.users)
    }
    setDeleteUserEmail('')
  }

  const deleteUser = async (email: string): Promise<any> => {
    const response = await fetch(`${process.env.REACT_APP_INSTANCE_URL}/admin_api/user`, {

      method: 'DELETE',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "email": email,
      })
    });
    return await response.json();
  }

  const getUsers = async (): Promise<User[]> => {
    const response = await fetch(`${process.env.REACT_APP_INSTANCE_URL}/admin_api/all_users`, {
      method: 'GET',
      headers: {
        Authorization: token
      }
    });
    return await response.json();
  }

  const UserList = () => {
    const listItems = users.map((user: User) => {
      return (
        <ListItem key={user.id}>
          <ListItemIcon  >
            <IconButton onClick={() => handleChangePassword(user)}>
              <CreateIcon />
            </IconButton>
          </ListItemIcon>
          <ListItemText
            primary={user.name.content[Object.keys(user.name.content)[0]]}
            secondary={user.role}
          />
          <ListItemSecondaryAction>
            <IconButton edge="end" onClick={() => handleDeleteDialogOpen(user.email)}>
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>)
    })
    return (
      <List className={classes.root}>{listItems}</List>
    )
  }

  return !!token ? (
    <React.Fragment>
      <div className={classes.container}>
        <h3 className={classes.btn}>Welcome, {loggedInEmail}</h3>
        <Button
          variant="contained"
          size="large"
          color="secondary"
          className={classes.btn}
          onClick={() => handleAddUser()}>
          Add User
      </Button>
        <UserList />
        <Dialog
          open={!!deleteUserEmail}
          onClose={handleDeleteDialogClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Delete User?"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              This action cannot be reversed
          </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteDialogClose} color="primary">
              Cancel
          </Button>
            <Button onClick={handleDeleteDialogConfirm} color="primary" autoFocus>
              Confirm
          </Button>
          </DialogActions>
        </Dialog>
      </div>
    </React.Fragment>
  ) : (<Redirect to='/login'></Redirect>)
}

export default Home;