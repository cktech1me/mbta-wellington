import React from 'react';
import co from 'co';

// Material UI
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import ListSubheader from 'material-ui/List/ListSubheader';
import List, {ListItem, ListItemText} from 'material-ui/List';
import Divider from 'material-ui/Divider';

// MBTA
import prediction from './mbta/prediction';
import logo from './logo.png';

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentTime: new Date(),
            schedules: [
                /*{
                    title: 'Swampscott -> North Station',
                    stop_id: 'Swampscott',
                    direction_id: 0,  // 0: Southbound, 1: Northbound
                    destination: 'place-north',
                    isFailed: false,
                    departureTime: []
                },*/
                {
                    title: 'North Station -> Swampscott',
                    stop_id: 'place-north',
                    direction_id: 0,
                    destination: 'Swampscott',
                    isFailed: false,
                    departureTime: []
                }
            ]
        }

        this.updateTime = this.updateTime.bind(this);
        this.render = this.render.bind(this);

        this.updateTime();
        setInterval(() => {
            if (new Date().getSeconds() % 10 === 0) {
                // update data every 10 sec
                this.updateTime();
            } else {
                // update current time every 1 sec
                this.setState({currentTime: new Date()});
            }
        }, 1000);
    }

    updateTime() {
        const self = this;

        co(function* () {
            const schedules = [];
            for (let i = 0; i < self.state.schedules.length; i++) {
                const sch = Object.assign({}, self.state.schedules[i]);
                try {
                    sch.departureTime = yield prediction(sch.stop_id, sch.direction_id);
                    sch.isFailed = false;
                } catch (e) {
                    sch.isFailed = true;
                }
                schedules.push(sch);
            }

            const state = {
                currentTime: new Date(),
                schedules
            };

            console.log('success', state);
            self.setState(state);
        })
            .catch(console.error);
    }

    getList(schedule, schedule_id) {
        const url = `https://www.mbta.com/schedules/CR-Newburyport/schedule?destination=${schedule.destination}&direction_id=${schedule.direction_id}&origin=${schedule.stop_id}`;
        const link = <a href={url}>{url}</a>;

        if (schedule.departureTime.length === 0) {

            // 1. No Data
            return [
                <ListItem key={schedule_id + '-time-0'}>
                    <ListItemText primary='No Data' secondary={link}/>
                </ListItem>
            ];
        }

        // 2. Departure Time
        const list = [];
        for (let i = 0; i < schedule.departureTime.length; i++) {
            const departureTime = schedule.departureTime[i];
            // train has left
           // if (departureTime - this.state.currentTime <= 0) {
           //     continue;
           // }

            const t = new Date(departureTime - this.state.currentTime);
            const MM = t.getMinutes() === 0 ? '' : (t.getMinutes() + 'm ');
            const SS = t.getSeconds() + 's';
            list.push(
                <ListItem key={schedule_id + '-time-' + i}>
                    <ListItemText
                        primary={"Departing: " + departureTime.toLocaleTimeString()}
                        secondary={MM + SS}
                    />
                </ListItem>
            );
        }
        return list;
    }

    render() {
        return (
            <div style={{textAlign: 'center'}}>
                <AppBar position="static" style={{backgroundColor: '#8f36ff', color: 'white'}}>
                    <Toolbar>
                        <a href='https://www.mbta.com/schedules/CR-Newburyport/schedule'>
                            <img alt='' src={logo} style={{height: '30px', width: '30px', marginRight: '-30px'}}/>
                        </a>
                        <Typography type="title" color="inherit" style={{margin: 'auto'}}>
                            {this.state.currentTime.toLocaleTimeString()}
                        </Typography>
                    </Toolbar>
                </AppBar>
                <List>
                    {
                        this.state.schedules.map((sch, index) => {
                            const id = 'sch-' + index;
                            const list = this.getList(sch, id);
                            list.unshift(
                                <ListSubheader key={id} style={{backgroundColor: 'white'}}>
                                    {sch.title + (sch.isFailed ? ' (Update Failed)' : '')}
                                </ListSubheader>);
                            list.push(<Divider key={id + '-divider'}/>);
                            return list;
                        })
                    }
                </List>
            </div>
        );
    }
}

export default App;
