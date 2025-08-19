import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList } from "react-native";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

export default function ChatScreen({ route }) {
  const { user, token } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    axios.get(`http://localhost:5000/conversations/${user._id}/messages`, { headers: { Authorization: token } })
      .then(res => setMessages(res.data))
      .catch(err => console.error(err));

    socket.on("message:new", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off("message:new");
    };
  }, []);

  const sendMessage = () => {
    socket.emit("message:send", { conversationId: user._id, senderId: "me", text });
    setText("");
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Text>{item.text}</Text>}
      />
      <TextInput value={text} onChangeText={setText} placeholder="Type message" />
      <Button title="Send" onPress={sendMessage} />
    </View>
  );
}
