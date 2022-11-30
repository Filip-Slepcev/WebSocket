import "./App.css";
import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
const socket = io("http://localhost:3001");

function App() {
	const [messages, setMessages] = useState([]);
	const [messageText, setMessageText] = useState("");
	const [joined, setJoined] = useState(false);
	const [name, setName] = useState("");
	const [typingDisplay, setTypingDisplay] = useState("");

	socket.on("message", (message) => {
		setMessages([...messages, message]);
	});

	useEffect(() => {
		socket.emit("findAllMessages", (response) => {
			setMessages([...response]);
		});

		socket.on("typing", ({ name, isTyping }) => {
			if (isTyping) {
				setTypingDisplay(`${name} is typing...`);
			} else {
				setTypingDisplay("");
			}
		});

		return () => {
			socket.off("typing");
		};
	}, []);

	const join = () => {
		socket.emit("join", { name: name }, () => {
			setJoined(true);
		});
	};

	const sendMessage = () => {
		socket.emit("createMessage", { text: messageText }, () => {
			socket.emit("typing", { isTyping: false });
			setMessageText("");
		});
	};

	const emitTyping = () => {
		socket.emit("typing", { isTyping: true });
		setTimeout(() => {
			socket.emit("typing", { isTyping: false });
		}, 1000);
	};

	return (
		<main>
			{!joined ? (
				<form
					onSubmit={(e) => {
						e.preventDefault();
						join();
					}}
				>
					<label htmlFor="name">Whats your name?</label>
					<input
						type="text"
						name="name"
						id="name"
						onChange={(e) => setName(e.target.value)}
					/>
					<button type="submit">Send</button>
				</form>
			) : (
				<div>
					{messages.map((message) => (
						<h3 key={message.text}>
							[{message.name}]: {message.text}
						</h3>
					))}
					{typingDisplay}
					<form
						onSubmit={(e) => {
							e.preventDefault();
							sendMessage();
						}}
					>
						<label>Message:</label>
						<input
							onChange={(e) => {
								if (e.target.value !== "") {
									emitTyping();
								}
								setMessageText(e.target.value);
							}}
							value={messageText}
						/>
						<button type="submit">Send</button>
					</form>
				</div>
			)}
		</main>
	);
}

export default App;
