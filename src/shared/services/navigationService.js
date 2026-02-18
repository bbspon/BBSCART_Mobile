// Navigation Service - Global navigation helper for cross-navigator navigation
import { CommonActions } from '@react-navigation/native';

let navigationRef = null;

export const setNavigationRef = (ref) => {
  navigationRef = ref;
};

export const navigate = (name, params = {}) => {
  if (navigationRef?.current) {
    navigationRef.current.dispatch(
      CommonActions.navigate({
        name,
        params,
      })
    );
  } else {
    console.warn('Navigation ref not set. Cannot navigate to:', name);
  }
};

export const goBack = () => {
  if (navigationRef?.current?.canGoBack()) {
    navigationRef.current.goBack();
  }
};

export const reset = (state) => {
  if (navigationRef?.current) {
    navigationRef.current.dispatch(CommonActions.reset(state));
  }
};

export default {
  setNavigationRef,
  navigate,
  goBack,
  reset,
};
