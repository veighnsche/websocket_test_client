import { makeStyles } from '@material-ui/core'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import CloudIcon from '@material-ui/icons/Cloud'
import CloudOffIcon from '@material-ui/icons/CloudOff'
import React, { useState } from 'react'

const useStyles = makeStyles(theme => ({
  container: {
    marginTop: theme.spacing(8),
  },
}))

function App() {
  const classes = useStyles()
  const [address, setAddress] = useState('')
  const [addressError, setAddressError] = useState('')
  const [connected, setConnected] = useState(false)
  const [webSocket, setWebSocket] = useState(null)
  const [message, setMessage] = useState('')
  const [consoleText, setConsoleText] = useState([{ color: 'grey', value: '' }])

  return (
    <Container maxWidth={'lg'}>
      <Grid container spacing={4}>
        <Grid item lg={12}>
          <Typography className={classes.container} variant={'h1'}>
            Websocket client
          </Typography>
        </Grid>
        <Grid item lg={4}>
          <Card>
            <CardHeader
              title={'Connect to URL'}
              subheader={connected ? 'Connected' : 'Disconnected'}
              subheaderTypographyProps={{ style: { color: connected ? 'green' : 'grey' } }}
              avatar={
                <Avatar style={{ backgroundColor: connected ? 'green' : 'grey' }}>
                  {connected ? <CloudIcon/> : <CloudOffIcon/>}
                </Avatar>
              }
            />
            <CardContent>
              <TextField
                fullWidth
                error={!!addressError}
                helperText={addressError}
                label={'Address'}
                placeholder={'wss://'}
                value={address}
                onChange={e => {
                  if (!/^(ws|wss):\/\/[^ "]+$/.test(e.target.value)) setAddressError('not a valid websocket address')
                  else setAddressError('')
                  setAddress(e.target.value)
                }}
              />
            </CardContent>
            <CardActions>
              <ButtonGroup fullWidth>
                <Button onClick={() => setAddress('wss://echo.websocket.org')}>
                  Echo
                </Button>
                <Button onClick={() => {
                  setWebSocket(null)
                  setConnected(false)
                  setConsoleText(console => [...console, { color: 'red', value: `disconnected` }])
                }}>
                  Disconnect
                </Button>
                <Button onClick={() => {
                  if (!address) setAddressError('no address filled')
                  else {
                    setAddressError('')
                    const socket = new WebSocket(address)

                    socket.onopen = () => {
                      setConnected(true)
                      setConsoleText(console => [...console, { color: 'green', value: `connected: ${address}` }])
                    }

                    socket.onclose = () => {
                      setConnected(false)
                      setConsoleText(console => [...console, { color: 'red', value: `disconnected` }])
                    }

                    socket.onerror = error => {
                      console.log(error)
                      setConsoleText(console => [...console, {
                        color: 'darkred',
                        value: `error: ${JSON.stringify(error)} (full error obj in console, but it doesn't say much)`,
                      }])
                    }

                    socket.onmessage = msg => {
                      setConsoleText(console => [...console, { color: 'grey', value: `received: ${msg.data}` }])
                    }

                    setWebSocket(socket)
                  }
                }}>
                  Connect
                </Button>
              </ButtonGroup>
            </CardActions>
          </Card>
        </Grid>
        <Grid item lg={4}>
          <Card>
            <CardHeader title={'Send Message'}/>
            <CardContent>
              <TextField
                fullWidth
                label={'message'}
                value={message}
                disabled={!connected}
                onChange={e => setMessage(e.target.value)}
              />
            </CardContent>
            <CardActions>
              <Button
                fullWidth
                variant={'outlined'}
                disabled={!connected}
                onClick={() => webSocket.send(message)}
              >
                Send
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item lg={4}>
          <Card>
            <CardHeader title={'Console'}/>
            <CardContent>

              {consoleText.map(({ color, value }, idx) => (
                <Typography key={idx} style={{ color }}>
                  {value}
                </Typography>
              ))}

            </CardContent>
            <CardActions>
              <Button
                fullWidth
                variant={'outlined'}
                onClick={() => setConsoleText([''])}
              >
                Clear
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default App
