// import React from 'react';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import LoginScreen from '../screens/authlogin/LoginScreen';
// import SignupScreen from '../screens/authSignup/SignupScreen.js';
// import SignupScreenGuider from '../screens/authSignup/SignupScreenGuider';
// import Intro from '../screens/auth/Intro.js';

// import UserTypeSelection from '../screens/dutyselector/UserTypeSelection.js'
// import SignupScreenOffical from '../screens/authSignup/SignupScreenOffical.js'

// const Stack = createNativeStackNavigator();

// export default function AuthStack() {
//   return (
//     <Stack.Navigator
//       initialRouteName="Intro"
//       screenOptions={{
//         headerShown: false,
//         gestureEnabled: false, 
//       }}
//     >
//       <Stack.Screen name="Intro" component={Intro} />
//       <Stack.Screen name="UserTypeSelection" component={UserTypeSelection} />
//       <Stack.Screen name="Login" component={LoginScreen} />
//       <Stack.Screen name="SignupScreenGuider" component={SignupScreenGuider} />
//       <Stack.Screen name="SignupScreenOffical" component={SignupScreenOffical} />
//       <Stack.Screen name="SignupScreen" component={SignupScreen} />
//     </Stack.Navigator>
//   );
// }
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/authlogin/LoginScreen';
import SignupScreen from '../screens/authSignup/SignupScreen.js';
import SignupScreenGuider from '../screens/authSignup/SignupScreenGuider';
import Intro from '../screens/auth/Intro.js';
import UserTypeSelection from '../screens/dutyselector/UserTypeSelection.js';
import SignupScreenOffical from '../screens/authSignup/SignupScreenOffical.js';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Intro"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true, // Fixed: Enable gestures for better UX
        animation: 'slide_from_right', // Add smooth animations
      }}
    >
      <Stack.Screen 
        name="Intro" 
        component={Intro} 
        options={{
          gestureEnabled: false, // Disable gesture on intro to prevent accidental navigation
        }}
      />
      <Stack.Screen name="UserTypeSelection" component={UserTypeSelection} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignupScreenGuider" component={SignupScreenGuider} />
      <Stack.Screen name="SignupScreenOffical" component={SignupScreenOffical} />
      <Stack.Screen name="SignupScreen" component={SignupScreen} />
    </Stack.Navigator>
  );
}
