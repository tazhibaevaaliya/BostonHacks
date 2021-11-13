import React, {Component, useState} from 'react';
import sortBy from 'sort-by';
import {CSSTransitionGroup} from 'react-transition-group';
import SwipeableViews from 'react-swipeable-views';
import AppBar from 'material-ui/AppBar';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import {Tabs, Tab} from 'material-ui/Tabs';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import CheckIcon from 'material-ui/svg-icons/action/check-circle';
import ListIcon from 'material-ui/svg-icons/action/list';
import TodoIcon from 'material-ui/svg-icons/action/today';
import EditIcon from 'material-ui/svg-icons/action/delete';
import CloseIcon from 'material-ui/svg-icons/content/delete-sweep';
import ColumnList from './ColumnList';
import ConfirmDialog from './ConfirmDialog';
import If from './If';
import './App.css';
//import async from '../server/speechDetection';
//import RecordRTC from "https://www.WebRTC-Experiment.com/RecordRTC.js"
import useScript from 'react-script-hook';

const MyComponent = props => {
  useScript("https://www.WebRTC-Experiment.com/RecordRTC.js");
}

/**
 * @description Main App component.
 * @constructor
 * @param {Object} props - The props that were defined by the caller of this component.
 */
class App extends Component {
	//message = "Hello"

	constructor(props) {
		super(props);

		/**
		 * @typedef {Object} ComponentState
		 * @property {Object[]} items - All list items of the app.
		 * @property {number} taskIdCounter - The index of the last task added.
		 * @property {boolean} submitDisabled - Indicates whether submit is disabled.
		 * @property {number} slideIndex - The index of the tab component.
		 * @property {boolean} dialogOpen - Visibility of the clear tasks dialog.
		 * @property {boolean} removeMode - Indicates if the remove mode is active.
		 */

		/** @type {ComponentState} */
		this.state = {
			items: [],
			taskIdCounter: 0,
			submitDisabled: true,
			slideIndex: 0,
			dialogOpen: false,
			removeMode: false,
		};
	}

	MyComponent = props => {
		useScript("https://www.WebRTC-Experiment.com/RecordRTC.js");
	  }
	  

	/**
	 * Lifecycle event handler called just after the App loads into the DOM.
	 * Get any saved items and taskIdCounter from the local storage and setup state with it.
	 */
	componentWillMount() {
		const toDoListItems = window.localStorage.getItem('toDoListItems') || '[]';
		const taskIdCounter = window.localStorage.getItem('taskIdCounter') || 0;
		//Get
		this.setState(
			{
				items: JSON.parse(toDoListItems),
				taskIdCounter: taskIdCounter,
			}
		);
	}

	/**
	 * @description Add task to the To Do list.
	 */
	addTask = () => {
		const input = this.taskInput.input || {};
		const { value = '' } = input;

		if (value === '') return;

		this.setState(previousState => {
			const { items = [] } = previousState;
			const { taskIdCounter = 0 } = previousState;
			const taskId = taskIdCounter+1;
			const newTask = {
				id: taskId,
				title: value,
				status: 'To Do'
			};
			items.push(newTask);
			return {
				items: items.sort(sortBy('id')),
				submitDisabled: true,
				taskIdCounter: taskId,
			}
		}, function stateUpdateComplete() {
			this.taskInput.input.value = '';
			this.updateLocalStorageItems(this.state.items);
			this.updateTaskCounter(this.state.taskIdCounter);
		}.bind(this));
	};



	/**
	 * @description Update task toggling between To Do/Done status.
	 * @param {Object} task - The task to be updated
	 */
	handleUpdateTask = (task) => {
		this.setState(previousState => {
			const { items } = previousState;
			const filteredItems = items.filter( item => item.id !== task.id);
			task.status = (task.status === 'To Do') ? 'Done' : 'To Do';
			filteredItems.push(task);
			return {
				items: filteredItems.sort(sortBy('id'))
			}
		}, function stateUpdateComplete() {
			this.updateLocalStorageItems(this.state.items);
		}.bind(this));
	};

	/**
	 * @description Remove task.
	 * @param {Object} task - The task to be removed.
	 */
	handleRemoveTask = (task) => {
		this.setState(previousState => {
			const { items } = previousState;
			const filteredItems = items.filter( item => item.id !== task.id);
			return {
				items: filteredItems.sort(sortBy('id'))
			}
		}, function stateUpdateComplete() {
			this.updateLocalStorageItems(this.state.items);
		}.bind(this));
	};

	/**
	 * @description Handle the Account Key TextField input change. It enable the submit button if field is not empty or
	 * disable it otherwise.
	 * @param {Object} event - On click event object
	 * @param {value} value - The task description
	 */
	handleTextFieldChange = (event, value) => {
		if((value.length > 0) && this.state.submitDisabled){
			this.setState({submitDisabled: false});
		}
		else if((value.length === 0) && !this.state.submitDisabled){
			this.setState({submitDisabled: true});
		}
	};

	/**
	 * @description Save items to local storage.
	 * @param {Object[]} items - Array of items/tasks to be saved.
	 */
	updateLocalStorageItems = (items) => {
		window.localStorage.setItem('toDoListItems', JSON.stringify(items));
	};

	/**
	 * @description Update current taskId into local storage.
	 * @param {number} taskCounter - Id of the task to be saved at local storage.
	 */
	updateTaskCounter = (taskCounter) => {
		window.localStorage.setItem('taskIdCounter', taskCounter);
	};

	/**
	 * @description Handle the tab change.
	 * @param {number} value - The index of the Tab.
	 */
	handleChange = (value) => {
		this.setState({
			slideIndex: value,
		}, function stateUpdateComplete() {
			// Fix scroll in swipe transitions
			window.scrollTo(0, 0);
		});
	};


	/**
	 * @description Enable the remove task mode.
	 */
	enableRemoveMode = () => {
		if (!this.state.removeMode) {
			this.setState({removeMode: true});
		}
	};

	/**
	 * @description Disable the remove task mode.
	 */
	disableRemoveMode = () => {
		if (this.state.removeMode) {
			this.setState({removeMode: false});
		}
	};

	/**
	 * @description Remove all tasks from the App.
	 */
	clearTasks = () => {
		this.handleDialogClose();
		this.setState({removeMode: false, items: []}, function stateUpdateComplete() {
			// Update local storage
			this.updateLocalStorageItems(this.state.items);
		});
	};

	/**
	 * @description Open the clear tasks dialog.
	 */
	handleDialogOpen = () => {
		this.setState({dialogOpen: true});
	};

	/**
	 * @description Close the clear task dialog.
	 */
	handleDialogClose = () => {
		this.setState({dialogOpen: false});
	};

	/**
	 * @description Handle the enter key pressed under the add task input.
	 * @param {Object} e - Key press event
	 */
	keyPress = (e) => {
		// If Enter key
		if(e.keyCode === 13){
			// Call method to add the task if not empty
			this.addTask();
			// put the login here
		}
	};

	message = ""
// runs real-time transcription and handles global variables
    run = async () => {
		console.log("here")
	// messageEl.style.display = 'none';
	let isRecording =  false;
	let socket;
	let recorder;

  	if (isRecording) { 
		if (socket) {
		socket.send(JSON.stringify({terminate_session: true}));
		socket.close();
		socket = null;
		}

		if (recorder) {
		recorder.pauseRecording();
		recorder = null;
		}
	} else {
		const response = await fetch('http://localhost:5000'); // get temp session token from server.js (backend)
		const data = await response.json();

		if(data.error){
		alert(data.error)
		}
    
    	const { token } = data;

		// establish wss with AssemblyAI (AAI) at 16000 sample rate
		socket = await new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`);

    // handle incoming messages to display transcription to the DOM
		const texts = {};
		socket.onmessage = (message) => {
		let msg = '';
		const res = JSON.parse(message.data);
		texts[res.audio_start] = res.text;
		const keys = Object.keys(texts);
		keys.sort((a, b) => a - b);
		console.log(keys)
		for (const key of keys) {
			if (texts[key]) {
			msg += ` ${texts[key]}`;
			}
		}
		// this.message = "msg"
		this.message = msg
		console.log(this.message)
		// messageEl.innerText = msg;
		// this.message = msg
		};

		socket.onerror = (event) => {
		console.error(event);
		socket.close();
		}
    
		socket.onclose = event => {
		console.log(event);
		socket = null;
		}

		socket.onopen = () => {
		// once socket is open, begin recording
		// messageEl.style.display = '';
		navigator.mediaDevices.getUserMedia({ audio: true })
			.then((stream) => {
			recorder = new MyComponent(stream, {
				type: 'audio',
				messageType:'FinalTranscript',
				mimeType: 'audio/webm;codecs=pcm', // endpoint requires 16bit PCM audio
				recorderType: 'StereoAudioRecorder', // ???
				timeSlice: 250, // set 250 ms intervals of data that sends to AAI
				desiredSampRate: 16000,
				numberOfAudioChannels: 1, // real-time requires only one channel
				bufferSize: 4096,
				audioBitsPerSecond: 128000,
				ondataavailable: (blob) => {
				const reader = new FileReader();
				reader.onload = () => {
					const base64data = reader.result;

					// audio data must be sent as a base64 encoded string
					if (socket) {
					socket.send(JSON.stringify({ audio_data: base64data.split('base64,')[1] }));
					}
				};
				reader.readAsDataURL(blob);
				},
			});

			recorder.startRecording();
			})
			.catch((err) => console.error(err));
		};
	}

  // isRecording = !isRecording;
  // buttonEl.innerText = isRecording ? 'Stop' : 'Record';
  // titleEl.innerText = isRecording ? 'Click stop to end recording!' : 'Click start to begin recording!'
	};


	render() {
		const { items = [] }  = this.state;
		const columns = [
			{ title: 'To Do', items: items.filter( item => item.status === 'To Do'), icon: <TodoIcon />},
			{ title: 'Done', items: items.filter( item => item.status === 'Done'), icon: <CheckIcon />},
			{ title: 'All', items, icon: <ListIcon />},
		];
		return (
			<MuiThemeProvider>
				<div className="App">
					<p>{this.message}</p>
					{/* Clear Tasks Confirmation Dialog */}
					<ConfirmDialog
						title="Clear All Tasks"
						message={'Are you sure you want to remove all tasks from the App?'}
						onCancel={this.handleDialogClose}
						onConfirm={this.clearTasks}
						open={this.state.dialogOpen}
					/>
					<AppBar
						title={<span style={{color: 'white'}}>To-Do List</span>}
						showMenuIconButton={false}
						style={{backgroundColor: '#D8B6A4', position: 'fixed', zIndex: 9999,}}
					/>
					<div className="App-container">
						<div style={{position: 'fixed', width: '100%', paddingTop: 64, zIndex: 8888, backgroundColor: 'white'}}>
							<TextField
								hintText="Type task"
								floatingLabelText="Add Task"
								ref={(taskInput) => {
									this.taskInput = taskInput;
								}}
								disabled={this.state.removeMode}
								style={{margin: 10, width: '60%', maxWidth: 300}}
								onChange={this.handleTextFieldChange}
								onKeyDown={this.keyPress}
							/>
							<RaisedButton
							style={{margin: 10, width: '30%', maxWidth: 56}}
							label="Record"
							onClick={this.run}/>
							<RaisedButton
								style={{margin: 10, width: '30%', maxWidth: 56}}
								label="Create"
								onClick={this.addTask}
								disabled={this.state.submitDisabled} />
							<Tabs
								onChange={this.handleChange}
								value={this.state.slideIndex}
							>
								{columns.map((column,index) => (
									<Tab
										key={index}
										value={index}
										icon={column.icon}
										label={
											<div>
												{column.title} ({(column.title !== 'All') ? column.items.filter(item => item.status === column.title).length: items.length})
											</div>
										}
									/>
								))}
							</Tabs>
						</div>
						<div className="app-separator">-</div>
						<CSSTransitionGroup
							transitionName="remove-mode-animation"
							transitionEnterTimeout={300}
							transitionLeaveTimeout={300}>
							{this.state.removeMode &&
								<div className="remove-mode">
									<RaisedButton
									label="Delete All Tasks"
									secondary={true}
									onClick={this.handleDialogOpen}
									/>
								</div>
							}
							<div className="app-lists">
								<SwipeableViews
									index={this.state.slideIndex}
									onChangeIndex={this.handleChange}
									style={{width: '100%'}}
								>
									{columns.map((column,index) => (
										<div
											className="swipeable-views"
											key={index}>
											<ColumnList
												title={column.title}
												items={column.items}
												updateTask={this.handleUpdateTask}
												removeTask={this.handleRemoveTask}
												removeMode={this.state.removeMode}
											/>
										</div>
									))}
								</SwipeableViews>
							</div>
						</CSSTransitionGroup>
					</div>
					<div className="enable-remove-mode">
						<If test={!this.state.removeMode}>
							<FloatingActionButton onClick={this.enableRemoveMode}>
								<EditIcon />
							</FloatingActionButton>
						</If>
						<If test={this.state.removeMode}>
							<FloatingActionButton secondary={true} onClick={this.disableRemoveMode}>
								<CloseIcon />
							</FloatingActionButton>
						</If>
					</div>
				</div>
			</MuiThemeProvider>
		);
	}
}

export default App;
