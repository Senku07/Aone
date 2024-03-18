import { React, useEffect,useState } from "react";
import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { url } from "../Url/url";

export default function LoginScreen() {
  let [userId, setUserId] = useState(null);
  const navi = useNavigation();
  
  useEffect(() => {
    setUserId(SecureStore.getItem('userId'));
    if (userId != null) {
      navi.navigate('Home');
    }
  }, [userId]);

  const [id, setId] = useState("");


  async function Submit() {
    const res = await fetch(url+"checkid", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
      }),
    });

    const data = await res.json();

    if (data != null) {
      if (res.status == 200) {
        await SecureStore.setItemAsync("userId", data.id);
        await SecureStore.setItemAsync("userName", data.name);
        await SecureStore.setItemAsync("localId", '');
        //console.log("Data is :", data);
        navi.navigate('Home');

      } else {
        alert("There are following Error :" + data);
      }
    } else {
      alert("Please Check User Id again");
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#31363F" style="auto" />
      <Text style={styles.real}>Realturity</Text>
      <View style={styles.input}>
        <TextInput
          onChangeText={(v) => setId(v)}
          style={styles.textInput}
          placeholder="User Id"
          placeholderTextColor="white"
          color="white"
        />

        <FontAwesome.Button
          name="arrow-right"
          iconStyle={(marginVertical = 30)}
          justifyContent="center"
          backgroundColor="#76ABAE"
          borderRadius={10}
          color="white"
          onPress={() => Submit()}
          beat
        >
          Next
        </FontAwesome.Button>
      </View>
      <Text style={styles.devLogo}>
        Project <Text style={styles.AO}>A0</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#222831",
  },
  real: {
    fontSize: 48,
    color: "#76ABAE",
    padding: 20,
    textAlign: "center",
  },
  input: {
    flex: 0,
    flexDirection: "column",
    padding: 20,
    gap: 60,
  },
  textInput: {
    width: 250,
    borderColor: "white",
    borderBottomWidth: 2,
    fontSize: 24,
  },
  buttonStyle: {
    fontSize: 38,
    backgroundColor: "red",
    width: 400,
  },
  devLogo: {
    width: "100%",
    fontSize: 18,
    color: "#76ABAE",
    textAlign: "right",
    padding: 20,
  },
  AO: {
    fontSize: 28,
    color: "white",
  },
});
