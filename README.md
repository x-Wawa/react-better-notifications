# react-better-notifications
Every kind of notifications implemented in react

## Installation

To install and set up the library, run:

```sh
$ npm install react-better-notifications
```

Or if you prefer using Yarn:

```sh
$ yarn add react-better-notifications
```
## API

### NotificationProvider

```jsx
import { NotificationsProvider } from "react-better-notifications";

<NotificationsProvider>
    <App />
</NotificationsProvider>
```

Adding the Notifications Provider at the root of you app will let you use the `addNotification` function from the `NotificationContext` hook to send notifications.

### NotificationContext & addNotification:

```tsx
import { NotificationContext } from "react-better-notifications"

  const { addNotification } = React.useContext(NotificationContext)

const MyComponent: React.FC = () => {
  const { data, error, loading } = useBasicFetch<Quote>('https://quotes.rest/quote/random?language=en&limit=1', 2000);

  if (error) {
    return addNotification(
      {
        type: "quickpopup",
        emoji: "⚠️",
        message: error
      })
  }
  
  if (loading) {
    return addNotification(
      {
        type: "quickpopup",
        emoji: "🔄",
        message: "Loading..."
      })
  }

  return (
    <div className="app">
      <h2>Super cool random Quote:</h2>
      {data && data.value && <p>{data.contents.quotes[0}.quote</p>}
    </div>
  );
};
```
`addNotification`

| Parameter | Type  | Description |
| --- | --- | --- |
| type | string | Notification type |
| emoji | string | Notification emoji |
| mesage | string | Notification type |
