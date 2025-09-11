/**
 * Navigation par onglets principale (Chats, Appels, Contacts, Paramètres)
 * Main tab navigation (Chats, Calls, Contacts, Settings)
 *
 * Interface similaire à WhatsApp avec onglets de navigation
 * WhatsApp-like interface with tab navigation
 */

import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import des écrans / Import screens
import ChatListScreen from '../screens/chat/ChatListScreen';
import CallListScreen from '../screens/calls/CallListScreen';
import ContactsScreen from '../screens/contacts/ContactsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

// Import des constantes / Import constants
import {COLORS} from '../constants/colors';

const Tab = createBottomTabNavigator();

/**
 * Configuration des icônes pour les onglets
 * Tab icons configuration
 */
const getTabIcon = (routeName, focused, color, size) => {
  let iconName;

  switch (routeName) {
    case 'Chats':
      iconName = focused ? 'chat' : 'chat-bubble-outline';
      break;
    case 'Calls':
      iconName = focused ? 'call' : 'call';
      break;
    case 'Contacts':
      iconName = focused ? 'contacts' : 'contacts';
      break;
    case 'Settings':
      iconName = focused ? 'settings' : 'settings';
      break;
    default:
      iconName = 'help-outline';
  }

  return <Icon name={iconName} size={size} color={color} />;
};

/**
 * Navigateur principal par onglets
 * Main tab navigator
 */
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) =>
          getTabIcon(route.name, focused, color, size),
        tabBarActiveTintColor: COLORS.PRIMARY_GREEN,
        tabBarInactiveTintColor: COLORS.TEXT_SECONDARY_LIGHT,
        tabBarStyle: {
          backgroundColor: COLORS.SURFACE_LIGHT,
          borderTopColor: COLORS.BORDER_LIGHT,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: COLORS.PRIMARY_GREEN,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: COLORS.WHITE,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      })}>
      {/* Onglet Chats / Chats tab */}
      <Tab.Screen
        name="Chats"
        component={ChatListScreen}
        options={{
          title: 'Solisakane',
          headerTitle: 'Chats',
        }}
      />

      {/* Onglet Appels / Calls tab */}
      <Tab.Screen
        name="Calls"
        component={CallListScreen}
        options={{
          title: 'Appels',
          headerTitle: 'Historique des appels',
        }}
      />

      {/* Onglet Contacts / Contacts tab */}
      <Tab.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{
          title: 'Contacts',
          headerTitle: 'Contacts',
        }}
      />

      {/* Onglet Paramètres / Settings tab */}
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Paramètres',
          headerTitle: 'Paramètres',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
