//Nguyễn Bá Tuân
//2124802010170

import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Contact = {
  avatar: string;
  name: string;
  email: string;
  phone: string;
  cell: string;
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const fetchContacts = async (): Promise<Contact[]> => {
  const response = await fetch('https://randomuser.me/api/?results=20&seed=fullstackio');
  const data = await response.json();
  return data.results.map((contact: any): Contact => ({
    avatar: contact.picture.large,
    name: `${contact.name.first} ${contact.name.last}`,
    email: contact.email,
    phone: contact.phone,
    cell: contact.cell,
  }));
};

const ContactListItem = ({
  contact,
  onPress,
}: {
  contact: Contact;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} style={styles.item}>
    <Image source={{ uri: contact.avatar }} style={styles.avatar} />
    <View>
      <Text style={styles.name}>{contact.name}</Text>
      <Text style={styles.phone}>{contact.phone}</Text>
    </View>
  </TouchableOpacity>
);

const RecentsScreen = ({
  navigation,
  toggleFavorite,
  favorites,
}: any) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts().then(data => {
      setContacts(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <FlatList
      data={contacts}
      keyExtractor={item => item.phone}
      renderItem={({ item }) => (
        <ContactListItem
          contact={item}
          onPress={() =>
            navigation.navigate('Profile', { contact: item, toggleFavorite, favorites })
          }
        />
      )}
    />
  );
};

const FavoritesScreen = ({
  navigation,
  favorites,
  toggleFavorite,
}: any) => {
  return (
    <FlatList
      data={favorites}
      keyExtractor={item => item.phone}
      renderItem={({ item }) => (
        <ContactListItem
          contact={item}
          onPress={() =>
            navigation.navigate('Profile', { contact: item, toggleFavorite, favorites })
          }
        />
      )}
    />
  );
};

const NearbyScreen = () => (
  <View style={styles.centered}>
    <Text style={{ fontSize: 20 }}>Nearby feature coming soon!</Text>
  </View>
);

const ProfileScreen = ({ route }: any) => {
  const { contact, toggleFavorite, favorites } = route.params;
  const isFavorite = favorites.some((c: Contact) => c.phone === contact.phone);

  return (
    <View style={styles.profileContainer}>
      <View style={styles.avatarSection}>
        <Image source={{ uri: contact.avatar }} style={styles.largeAvatar} />
        <Text style={styles.profileName}>{contact.name}</Text>
        <Text style={styles.profileText}>{contact.phone}</Text>
      </View>

      <View style={styles.detailsSection}>
        <TouchableOpacity
          onPress={() => toggleFavorite(contact)}
          style={styles.favoriteButton}
        >
          <Text style={styles.favoriteButtonText}>
            {isFavorite ? '❌ Bỏ khỏi Favorites' : '💚 Thêm vào Favorites'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.detailItem}>📧 {contact.email}</Text>
        <Text style={styles.detailItem}>☎️ {contact.phone}</Text>
        <Text style={styles.detailItem}>📱 {contact.cell}</Text>
      </View>
    </View>
  );
};

export default function App() {
  const [favorites, setFavorites] = useState<Contact[]>([]);

  const toggleFavorite = (contact: Contact) => {
    setFavorites(prev => {
      const exists = prev.find(c => c.phone === contact.phone);
      return exists ? prev.filter(c => c.phone !== contact.phone) : [...prev, contact];
    });
  };

  const RecentsStack = () => (
    <Stack.Navigator>
      <Stack.Screen name="Recents">
        {(props) => (
          <RecentsScreen {...props} toggleFavorite={toggleFavorite} favorites={favorites} />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="Profile"
        options={({ route }: any) => ({
          title: route.params.contact.name.split(' ')[0],
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: 'white',
        })}
      >
        {(props) => (
          <ProfileScreen {...props} toggleFavorite={toggleFavorite} favorites={favorites} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );

  const FavoritesStack = () => (
    <Stack.Navigator>
      <Stack.Screen name="Favorites">
        {(props) => (
          <FavoritesScreen {...props} favorites={favorites} toggleFavorite={toggleFavorite} />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="Profile"
        options={({ route }: any) => ({
          title: route.params.contact.name.split(' ')[0],
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: 'white',
        })}
      >
        {(props) => (
          <ProfileScreen {...props} toggleFavorite={toggleFavorite} favorites={favorites} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let icon: string;
            if (route.name === 'RecentsTab') icon = 'time';
            else if (route.name === 'FavoritesTab') icon = 'heart';
            else icon = 'navigate';
            return <Ionicons name={icon} size={size} color={color} />;
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="RecentsTab" component={RecentsStack} options={{ title: 'Recents' }} />
        <Tab.Screen name="FavoritesTab" component={FavoritesStack} options={{ title: 'Favorites' }} />
        <Tab.Screen name="Nearby" component={NearbyScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  avatar: {
    width: 50, height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  name: { fontSize: 16, fontWeight: 'bold' },
  phone: { color: '#555' },
  profileContainer: { flex: 1 },
  avatarSection: {
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  largeAvatar: { width: 120, height: 120, borderRadius: 60 },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
    color: 'white',
  },
  profileText: { color: 'white', fontSize: 16 },
  detailsSection: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginTop: -20,
  },
  favoriteButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  favoriteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  detailItem: {
    fontSize: 16,
    marginBottom: 10,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
