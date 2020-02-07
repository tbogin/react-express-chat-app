import React from "react";
import io from "socket.io-client";
import axios from 'axios';

import logo from '../../../src/logo.svg';
import sendIcon from '../../../src/send-icon.png';
import calendarIcon from '../../../src/calendar-icon.svg';
import './Chat.scss';
import "typeface-roboto";

class Chat extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            currentUser: {
                username: 'ted',
                real_name: 'Ted',
                profilePhoto: logo,
                message: '',
                ts: '',
                isFlipped: false
            },
            username: '',
            message: '',
            messages: [],
            users: [],
            maxCharacters: 140,
            characterCount: 140
        };

        this.socket = io('localhost:8080');

        this.socket.on('RECEIVE_MESSAGE', function(newMsgData){
            addMessage(newMsgData);
        });

        const addMessage = newMsgData => {
            this.setState({messages: [...this.state.messages, newMsgData]});
            const userData = this.state.messages;
            axios({
                method: 'post',
                url: `./data.json`,
                data: userData,
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
            }).then(function (response) {
                console.log('Posted', response);
            }).catch(function (error) {
                console.log('err', error);
            });
            document.getElementById('chat-input-field').value = '';
        };

        this.sendMessage = ev => {
            ev.preventDefault();
            this.socket.emit('SEND_MESSAGE', {
                currentUser: this.state.currentUser.username,
                message: this.state.currentUser.message,
                ts: new Date(),
            });
        }

        this.handleInputChange = ev => {
            ev.preventDefault();
            this.setState({currentUser: {...this.state.currentUser, ['message']: ev.target.value}});
            
            const charLength = this.state.currentUser.message.length;
            this.setState({characterCount: this.state.maxCharacters - charLength});
            if(this.state.characterCount <= 0) {
                console.log('ah');
            }
        }
    }

    componentDidMount() {
        this.getChatData();
    }

    getChatData() {
        axios.get(`./data.json`)
            .then(res => {
                const users = res.data.users;
                const posts = res.data.posts;
                const oldMessages = posts.map(x => Object.assign(x, users.find(y => y.id === x.user)));
                this.setState({messages: oldMessages});
                console.log('messages', this.state.messages);
            });
    }

    formatTimestamp(ts) {
        const timestamp = new Date(ts);
        const formattedDate = timestamp.getDate() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getFullYear();
        const hours = (timestamp.getHours() < 10) ? "0" + timestamp.getHours() : timestamp.getHours();
        const minutes = (timestamp.getMinutes() < 10) ? "0" + timestamp.getMinutes() : timestamp.getMinutes();
        const formattedTime = hours + ":" + minutes;
        const date = formattedDate + " " + formattedTime;
        return date;
    }

    flipMessage = (message) => {
        message.isFlipped = !message.isFlipped;
        this.setState({messages: [...this.state.messages]});
    }

    render(){
        return (
            <div className="Chat container">
                <div className="row">
                    <div className="col col-md-8 offset-md-2">
                        <div className="card">
                            <div className="card-body">
                                <div className="messages">
                                    {this.state.messages.map((message, i) => {
                                            return (
                                                <div className={"message row" + (message.currentUser ? ' currentUserMessage' : '')} key={i}>
                                                    <div className="col-1 col-md-2">
                                                        <img src={message.profilePhoto || this.state.currentUser.profilePhoto} alt="photo" className="chat-img"></img>
                                                    </div>
                                                    <div className="col-9 col-xl-8 message-outer-container">
                                                        <div className="row message-container">                                                             
                                                            <div className="chat-name-username-container col col-md-7 offset-2 offset-md-0">
                                                                {message.real_name &&<div>{message.real_name} - @{message.username}</div>}
                                                            </div>
                                                            <div className={"d-none d-md-block chat-timestamp" + (!message.currentUser ? ' col-md-4 col-lg-3 offset-lg-2 ': '')}>
                                                                <div>{this.formatTimestamp(message.ts)}</div>
                                                            </div>
                                                            <div className="d-md-none chat-timestamp-mobile">
                                                                <div>{this.formatTimestamp(message.ts)}</div>
                                                            </div>
                                                            <div className="row scene" onClick={() => this.flipMessage(message)}>
                                                                <div className={"col flip-card-inner" + (message.isFlipped ? ' is-flipped': '')}>
                                                                    <div className="message-body message-body-front">
                                                                        <div>{message.message}</div>
                                                                    </div>
                                                                    <div className="message-body message-body-back">
                                                                        <div><img src={calendarIcon} className="calendar-icon"></img> active since July 13th, 2017</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                    })}
                                </div>
                            </div>
                            <div className="row chat-input-container">
                                <div className="col-2 col-xl-1">
                                    <div className={"chat-char-count" + (this.state.characterCount <= 0 ? ' exceeded-msg-length' : '')}>{this.state.characterCount}</div>
                                </div>
                                <div className="col-8 col-xl-10">
                                    <input
                                        id="chat-input-field" 
                                        type="text" 
                                        placeholder="what's happening?" 
                                        className="form-control chat-input" 
                                        value={this.state.currentUser.message} 
                                        onChange={this.handleInputChange}/>                                                            
                                </div>
                                <div className="col-1">
                                    <button 
                                        onClick={this.sendMessage} 
                                        className="form-control chat-submit-btn">
                                        <img src={sendIcon} alt="send" className="chat-send-icon"></img>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Chat;