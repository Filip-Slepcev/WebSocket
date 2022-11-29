"use client";
import { emit } from "process";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type Message = {
	name: string;
	text: string;
};

interface ServerToClientEvents {
	message: (message: Message) => void;
	typing: ({ name, isTyping }: { name: string; isTyping: boolean }) => void;
}

interface ClientToServerEvents {
	join: ({ name }: { name: string }, callback: () => void) => void;
	createMessage: ({ text }: { text: string }, callback: () => void) => void;
	typing: ({ isTyping }: { isTyping: boolean }) => void;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io("http://localhost:3001");

export default function HomePage() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [messageText, setMessageText] = useState("");
	const [joined, setJoined] = useState(false);
	const [name, setName] = useState("");
	const [typingDisplay, setTypingDisplay] = useState("");

	socket.on("message", (message) => {
		setMessages([...messages, message]);
	});

	useEffect(() => {
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
		socket.emit("join", { name }, () => setJoined(true));
	};

	const sendMessage = () => {
		socket.emit("createMessage", { text: messageText }, () => {
			setMessageText("");
		});
	};

	let timeout;
	const emitTyping = () => {
		socket.emit("typing", { isTyping: true });
		timeout = setTimeout(() => {
			socket.emit("typing", { isTyping: false });
		}, 2000);
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
