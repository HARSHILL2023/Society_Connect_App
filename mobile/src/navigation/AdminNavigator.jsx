import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../constants/theme';

// Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UsersManagementScreen from '../screens/admin/UsersManagementScreen';
import CreateUserScreen from '../screens/admin/CreateUserScreen';
import AllTicketsScreen from '../screens/manager/AllTicketsScreen';
import TicketDetailScreen from '../screens/member/TicketDetailScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Admin Users Stack
const AdminUsersStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="UsersList" component={UsersManagementScreen} />
    <Stack.Screen name="CreateUser" component={CreateUserScreen} />
  </Stack.Navigator>
);

// Admin Tickets Stack
const AdminTicketsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminTicketsList" component={AllTicketsScreen} />
    <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
  </Stack.Navigator>
);

// Admin Dashboard Stack
const AdminDashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminDashboardMain" component={AdminDashboardScreen} />
    <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
  </Stack.Navigator>
);

export const AdminNavigator = () => {
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
        tabBarActiveTintColor: '#EF4444',
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          ...TYPOGRAPHY.small,
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'DashboardTab') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'UsersTab') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'TicketsTab') {
            iconName = focused ? 'layers' : 'layers-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'shield' : 'shield-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={AdminDashboardStack}
        options={{ tabBarLabel: 'Metrics' }}
      />
      <Tab.Screen
        name="UsersTab"
        component={AdminUsersStack}
        options={{ tabBarLabel: 'Accounts' }}
      />
      <Tab.Screen
        name="TicketsTab"
        component={AdminTicketsStack}
        options={{ tabBarLabel: 'Complaints' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={AdminProfileScreen}
        options={{ tabBarLabel: 'Console' }}
      />
    </Tab.Navigator>
  );
};

export default AdminNavigator;
