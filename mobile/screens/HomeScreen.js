import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import axios from "axios";

export default function HomeScreen({ navigation, route }) {
  const { token } = route.params;
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/users", { headers: { Authorization: token } })
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text>Users</Text>
      <FlatList
        data={users}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate("Chat", { user: item, token })}>
            <Text style={{ padding: 10 }}>{item.username}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
