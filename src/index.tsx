import React from "react"


export interface NotificationsProps {
  type: "quickpopup";
  message: string;
}

export type NotificationProps = QuickPopupProps;

export type Notification = QuickPopupNotification;

export interface QuickPopupProps extends NotificationsProps {
  type: "quickpopup";
  emoji: string;
  duration?: number;
}

export interface QuickPopupNotification extends QuickPopupProps {
  id: number;
  duration: number;
  deleteAt: number;
}

export interface NotificationsProviderProps {
  notifications: Notification[];
  addNotification: (Notification: NotificationProps) => void;
}

export const NotificationContext = React.createContext<NotificationsProviderProps>(
  {
    notifications: [],
    addNotification: () => {}
  }
);

function buildNotificationByType(Notification: NotificationProps): Notification {

  let NotificationID = (Math.round(Math.random() * 1000) * (new Date().getTime()) * Math.random() * 1000)

  let deleteAt = new Date().getTime() + (Notification.duration || 2000)

  switch(Notification.type) {
    case "quickpopup":
      return {
        ...Notification,
        id: NotificationID,
        duration: Notification.duration || 2000,
        deleteAt
      }
  }
}

const css = `
@keyframes quickPopupSpawn {
  0%   { transform: scale(0.5);  }
  40%  { transform: scale(1.1);  }
  100% { transform: scale(1.0); }
}

@keyframes quickPopupDespawn {
  0%   { opacity:1;}
  100% { opacity:0; }
}

@keyframes quickPopupGoUp {
  0%   { transform: translateY(0px);}
  100% { transform: translateY(-90px); }
}
`

export interface notificationsStyle {
  QuickPopupStyle?: {
    notificationContainer?: React.CSSProperties,
    emojiText?: React.CSSProperties,
    messageText?: React.CSSProperties
  }
}

const defaulNotificationsStyle: notificationsStyle = {
  QuickPopupStyle: {
    notificationContainer: {
      backgroundColor: "white",
      width: "250px",
      height: "70px",
      borderRadius: "20px",
      fontFamily: 'sans-serif'
    }
  }
}

export function NotificationsProvider({children, useDefaultStyle, notificationsStyle}: {children: React.ReactNode, useDefaultStyle?: boolean, notificationsStyle?: notificationsStyle}): JSX.Element {

  if (!useDefaultStyle) throw ReferenceError("If you disable the use of default styles you must pass the `notificationsStyle` property as a parameter to the `NotificationsProvider`")

  const [notifications, setNotification] = React.useState<Notification[]>([])

  function addNotification(Notification: NotificationProps) {
    setNotification((notifs) =>
      [
        ...notifs,
        buildNotificationByType(Notification)
      ]
    )
  }

  const removeNotification = (NotificationID: number, ms = 0) => {
    setTimeout(() => {
      setNotification((notifs) => {
        const newNotifs = notifs.filter((notif) => notif.id !== NotificationID);
        return newNotifs
      })
    }, ms);
  }

  const NotificationComponent = React.memo(({Notification}: {Notification: Notification}): React.ReactElement => {

    if (Notification.duration && Notification.duration > 0) removeNotification(Notification.id!, Notification.duration)
    
    const PopUpNotificationsArray = notifications.filter(notif => notif.type === "quickpopup")

    let notifComponent: React.ReactElement;

    switch(Notification.type) {
      case "quickpopup":
        notifComponent = (
          <div
            className='quickPopupNotificationContainer'
            style={{
              top: PopUpNotificationsArray.indexOf(Notification) * 80 + 10,
              animation: `quickPopupDespawn 0.3s linear ${(Notification.duration! - 300) / 1000}s forwards, quickPopupGoUp 0.3s linear ${(PopUpNotificationsArray[0].deleteAt! - new Date().getTime() - 300) / 1000}s forwards${(PopUpNotificationsArray.indexOf(Notification) === PopUpNotificationsArray.length - 1 && (Notification.deleteAt! - new Date().getTime()) > 1900) ? `, quickPopupSpawn 0.2s cubic-bezier(1, 0.51, 0.74, 0.69)` : ""}`,
              position: "fixed",
              left: 'calc(50vw - 100px)',
              zIndex: 1000,
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              overflow: "hidden",
              ...(useDefaultStyle ? defaulNotificationsStyle.QuickPopupStyle.notificationContainer : null),
              ...notificationsStyle?.QuickPopupStyle?.notificationContainer
            }}
          >
            <p style={{...(useDefaultStyle ? defaulNotificationsStyle.QuickPopupStyle.emojiText : null), ...notificationsStyle?.QuickPopupStyle?.emojiText}}>{Notification.emoji}</p>
            <p style={{...(useDefaultStyle ? defaulNotificationsStyle.QuickPopupStyle.messageText : null), ...notificationsStyle?.QuickPopupStyle?.messageText}}>{Notification.message}</p>
          </div>
        )
        break;
    }

    return notifComponent
  })


  return (
    <NotificationContext.Provider value={{notifications, addNotification}}>
      <style>{css}</style>
      {
        notifications.map((notif) => {
          return <NotificationComponent key={notif.id} Notification={notif} />
        })
      }
      {children}
    </NotificationContext.Provider>
  );
}

const _ = {
  NotificationsProvider,
  NotificationContext
}

export default _;