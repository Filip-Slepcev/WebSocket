import "./App.css";
import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
const socket = io("http://localhost:3001");

function App() {
	const [messages, setMessages] = useState([]);

	useEffect(() => {
		socket.emit("findAllMessages", {}, (response) => {
			console.log(response);
			setMessages(response);
		});

		return () => {
			//   socket.off('connect');
			//   socket.off('disconnect');
			//   socket.off('pong');
		};
	}, []);

	return (
		<div className="chat">
			<div className="chat-container">
				<h3>{messages}</h3>
				<div className="messages-container">
					{messages.map((message) => {
						return (
							<h5>
								[{message.name}]: {message.text}
							</h5>
						);
					})}
				</div>
			</div>
		</div>
	);
}

export default App;
