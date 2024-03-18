import { Alert, StyleSheet, ToastAndroid } from "react-native";
import { View, Text, StatusBar, Button } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome6";
import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { url } from "../Url/url";
import { ScrollView, SafeAreaView } from "react-native";

export default function Home() {
  const userId = SecureStore.getItem("userId");
  const userName = SecureStore.getItem("userName");
  const [refresh, setRefresh] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [userData, setUserData] = useState([]);
  const WageHour = 6;

  const month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    async function fetchData() {
      const data = await fetch(url + "fetchdata", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          month: currentMonth.toString(),
        }),
      });

      if (data.status == 200) {
        const a = await data.json();
        setUserData(a);
      } else {
        alert("Error in database");
      }
    }
    fetchData();
  }, [currentMonth, refresh]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#31363F" style="auto" />
      <Text style={styles.real}>Realturity</Text>

      <Ionicons style={styles.ionIcon} name="person" size={32} color="white">
        {" "}
        <Text>{userName}</Text>{" "}
      </Ionicons>
      <View style={styles.mainButton}>
        <FontAwesome.Button
          name="user-check"
          backgroundColor="#76ABAE"
          size={48}
          color={"white"}
          borderRadius={8}
          justifyContent="center"
          alignItems="center"
          padding={24}
          marginHorizontal={4}
          onPress={() => punchIn(userId, setRefresh)}
        >
          Punch in
        </FontAwesome.Button>

        <FontAwesome.Button
          name="circle-chevron-right"
          backgroundColor="#31363F"
          size={48}
          color={"#E74C3C"}
          borderRadius={8}
          justifyContent="center"
          alignItems="center"
          padding={24}
          marginHorizontal={4}
          onPress={() => punchOut(setRefresh)}
        >
          Punch out
        </FontAwesome.Button>
      </View>
      <View style={styles.Break} />
      <View style={styles.total}>
        <View style={styles.dataRow}>
          <Text style={styles.greenTextXL}> 10 </Text>
          <Text style={styles.greenText}> Present </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.redTextXL}> 10 </Text>
          <Text style={styles.redText}> Absent </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.yellowTextXL}> 10 </Text>
          <Text style={styles.yellowText}> Half-Day </Text>
        </View>
      </View>

      <View>
        <FontAwesome.Button name="arrow-left" backgroundColor="#222831">
          {month[currentMonth]}
        </FontAwesome.Button>
      </View>

      <View style={styles.Break} />
      <View style={styles.list}>
        <Text style={styles.listItem}>PunchIn</Text>
        <Text style={styles.listItem}>PunchOut</Text>
        <Text style={styles.listItem}>Status</Text>
      </View>

      <View style={styles.Break} />

      <ScrollView>
        {userData &&
          userData.map((s) => {
            return (
              <View key={s.id} style={styles.list}>
                <Text style={styles.listItem}>
                  {new Date(s.punchIn).toLocaleString("en-GB", {
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
                <Text style={styles.listItem}>
                  {s.punchOut &&
                    new Date(s.punchOut).toLocaleString("en-GB", {
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </Text>
                <View style={styles.listItem}>
                  {new Date(s.punchOut) - new Date(s.punchIn) >
                  { WageHour } * 60 * 60 * 1000 ? (
                    <Text style={styles.listItem}>Present</Text>
                  ) : (
                    <Text style={styles.listItem}>Half-Day</Text>
                  )}
                </View>
              </View>
            );
          })}
      </ScrollView>
      <View style={styles.Break} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#222831",
  },
  mainButton: {
    alignItems: "center",
    justifyContent: "space-around",
    flexDirection: "row",
    width: "100%",
    padding: 10,
  },
  real: {
    fontSize: 36,
    color: "#76ABAE",
    //backgroundColor:'red',
    padding: 10,
    textAlign: "center",
  },
  Break: {
    borderBottomColor: "white",
    borderBottomWidth: 2,
    marginHorizontal: 20,
  },
  total: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  greenText: {
    color: "#7fff00",
    fontSize: 18,
  },
  greenTextXL: {
    color: "#7fff00",
    fontSize: 28,
  },
  redText: {
    color: "#ffa07a",
    fontSize: 18,
  },
  redTextXL: {
    color: "#ffa07a",
    fontSize: 28,
  },
  yellowText: {
    color: "#fdfd96",
    fontSize: 18,
  },
  yellowTextXL: {
    color: "#fdfd96",
    fontSize: 28,
  },
  dataRow: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  ionIcon: {
    padding: 8,
    margin: 2,
    height: 60,
  },
  list: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  listItem: {
    color: "white",
  },
});

async function punchIn(userId, setRefresh) {
  const localId = await SecureStore.getItemAsync("localId");
  if (localId == "") {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      alert("Location Denied !");
      return;
    }

    let location = await Location.getCurrentPositionAsync();

    const response = await fetch(url + "punchin", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: userId,
        latitude: location.coords.latitude.toString(),
        longitude: location.coords.longitude.toString(),
      }),
    });

    const data = await response.json();

    if (response.status == 200) {
      await SecureStore.setItemAsync("localId", data.id);
      setRefresh(true);
      ToastAndroid.show("Punch in successfully!", ToastAndroid.SHORT);
    } else {
      alert("Error : connecting to database");
    }
  } else {
    alert("Already Punch In...");
  }
}

async function punchOut(setRefresh) {
  const localId = await SecureStore.getItemAsync("localId");

  if (localId != "") {
    let location = await Location.getCurrentPositionAsync();
    const response = await fetch(url + "punchout", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: localId,
        latitude: location.coords.latitude.toString(),
        longitude: location.coords.longitude.toString(),
      }),
    });

    const data = await response.json();

    if (response.status == 200) {
      await SecureStore.setItemAsync("localId", "");
      ToastAndroid.show("Punch out successfully!", ToastAndroid.SHORT);
      setRefresh(false);
    } else {
      alert("Error : connecting to database");
    }
  } else {
    alert("Punch In First...");
  }
}
