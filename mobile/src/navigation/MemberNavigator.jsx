import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../constants/theme';

// Screens
import MemberHomeScreen from '../screens/member/MemberHomeScreen';
import MyTicketsScreen from '../screens/member/MyTicketsScreen';
import CreateTicketScreen from '../screens/member/CreateTicketScreen';
import TicketDetailScreen from '../screens/member/TicketDetailScreen';
import MemberProfileScreen from '../screens/member/MemberProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Member Tickets Stack (List -> Detail)
const MemberTicketsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MyTicketsList" component={MyTicketsScreen} />
    <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
  </Stack.Navigator>
);

// Member Home Stack (Home -> Ticket Detail)
const MemberHomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MemberHomeMain" component={MemberHomeScreen} />
    <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
  </Stack.Navigator>
);

export const MemberNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: COLORS.primaryLight,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          ...TYPOGRAPHY.small,
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'TicketsTab') {
            iconName = focused ? 'file-tray-full' : 'file-tray-full-outline';
          } else if (route.name === 'NewTicketTab') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={MemberHomeStack}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="TicketsTab"
        component={MemberTicketsStack}
        options={{ tabBarLabel: 'Complaints' }}
      />
      <Tab.Screen
        name="NewTicketTab"
        component={CreateTicketScreen}
        options={{ tabBarLabel: 'Raise New' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={MemberProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default MemberNavigator;
