import "./App.css";
import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
const socket = io("http://localhost:3001");

function App() {
	const [messages, setMessages] = useState([]);

	useEffect(() => {
		socket.emit("findAllMessages", (response) => {
			setMessages([...response]);
		});

		// socket.on("message", (message) => {
		// 	setMessages([...messages, message]);
		// });

		// socket.on("typing", ({ name, isTyping }) => {
		// 	if (isTyping) {
		// 		setTypingDisplay(`${name} is typing...`);
		// 	} else {
		// 		setTypingDisplay("");
		// 	}
		// });
	}, []);

	return (
		<div className="chat">
			<div className="chat-container">
				<div className="messages-container">
					{messages.map((message) => (
						<h3 key={message}>
							[{message.name}]: {message.text}
						</h3>
					))}
				</div>
			</div>
		</div>
	);
}

export default App;
