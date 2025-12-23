import "@testing-library/jest-native/extend-expect";

// Some parts of the app rely on this env var for URL building.
process.env.EXPO_PUBLIC_DOMAIN ||= "example.com";
