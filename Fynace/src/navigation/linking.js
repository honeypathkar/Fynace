const linking = {
  prefixes: ['fynace://'],
  config: {
    screens: {
      Splash: 'splash',
      Onboarding: 'onboarding',
      Login: 'login',
      AppTabs: {
        path: 'tabs',
        screens: {
          Home: 'home',
          Expenses: 'expenses',
        },
      },
      Profile: 'profile',
      EditProfile: 'edit-profile',
      Tools: 'tools',
      ExcelUpload: 'excel-upload',
      AddExpense: 'add-expense',
      QRScanner: 'qr-scanner',
      AddQRBasedExpense: 'add-qr-expense',
      WebView: 'webview',
      BankSmsConfig: 'bank-sms-config',
      SmsFetch: 'sms-fetch',
      RecurringTransactions: 'recurring-transactions',
      Budgets: 'budgets',
      AdminPanel: 'admin-panel',
      FeedbackHistory: {
        path: 'feedback-history',
        parse: {
          openHistory: () => true,
        },
      },
    },
  },
};

export default linking;
