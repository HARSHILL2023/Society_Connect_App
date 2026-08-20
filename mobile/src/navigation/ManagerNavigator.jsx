import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../constants/theme';

// Screens
import ManagerDashboardScreen from '../screens/manager/ManagerDashboardScreen';
import AllTicketsScreen from '../screens/manager/AllTicketsScreen';
import TicketDetailScreen from '../screens/member/TicketDetailScreen';
import ManagerProfileScreen from '../screens/manager/ManagerProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Manager Tickets Stack
const ManagerTicketsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AllTicketsList" component={AllTicketsScreen} />
    <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
  </Stack.Navigator>
);

// Manager Dashboard Stack
const ManagerDashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ManagerDashboardMain" component={ManagerDashboardScreen} />
    <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
  </Stack.Navigator>
);

export const ManagerNavigator = () => {
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
        tabBarActiveTintColor: '#06B6D4',
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          ...TYPOGRAPHY.small,
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'DashboardTab') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'TicketsTab') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={ManagerDashboardStack}
        options={{ tabBarLabel: 'Desk' }}
      />
      <Tab.Screen
        name="TicketsTab"
        component={ManagerTicketsStack}
        options={{ tabBarLabel: 'Complaints' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ManagerProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default ManagerNavigator;
