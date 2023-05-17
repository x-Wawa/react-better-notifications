import React, { useContext } from "react";
export const NotificationContext = React.createContext({
    notifications: [],
    addNotification: () => { }
});
function buildNotificationByType(Notification) {
    let NotificationID = (Math.round(Math.random() * 1000) * (new Date().getTime()) * Math.random() * 1000);
    let deleteAt = new Date().getTime() + (Notification.duration || 2000);
    switch (Notification.type) {
        case "quickpopup":
            return {
                ...Notification,
                id: NotificationID,
                duration: Notification.duration || 2000,
                deleteAt
            };
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
`;
const defaulNotificationsStyle = {
    QuickPopupStyle: {
        notificationContainer: {
            backgroundColor: "white",
            width: "250px",
            height: "70px",
            borderRadius: "20px",
            fontFamily: 'sans-serif'
        }
    }
};
export const useNotification = () => {
    return useContext(NotificationContext).addNotification;
};
export function NotificationsProvider({ children, useDefaultStyle, notificationsStyle }) {
    if (!useDefaultStyle)
        throw ReferenceError("If you disable the use of default styles you must pass the `notificationsStyle` property as a parameter to the `NotificationsProvider`");
    const [notifications, setNotification] = React.useState([]);
    function addNotification(Notification) {
        setNotification((notifs) => [
            ...notifs,
            buildNotificationByType(Notification)
        ]);
    }
    const removeNotification = (NotificationID, ms = 0) => {
        setTimeout(() => {
            setNotification((notifs) => {
                const newNotifs = notifs.filter((notif) => notif.id !== NotificationID);
                return newNotifs;
            });
        }, ms);
    };
    const NotificationComponent = React.memo(({ Notification }) => {
        if (Notification.duration && Notification.duration > 0)
            removeNotification(Notification.id, Notification.duration);
        const PopUpNotificationsArray = notifications.filter(notif => notif.type === "quickpopup");
        let notifComponent;
        switch (Notification.type) {
            case "quickpopup":
                notifComponent = (React.createElement("div", { className: 'quickPopupNotificationContainer', style: {
                        top: PopUpNotificationsArray.indexOf(Notification) * 80 + 10,
                        animation: `quickPopupDespawn 0.3s linear ${(Notification.duration - 300) / 1000}s forwards, quickPopupGoUp 0.3s linear ${(PopUpNotificationsArray[0].deleteAt - new Date().getTime() - 300) / 1000}s forwards${(PopUpNotificationsArray.indexOf(Notification) === PopUpNotificationsArray.length - 1 && (Notification.deleteAt - new Date().getTime()) > 1900) ? `, quickPopupSpawn 0.2s cubic-bezier(1, 0.51, 0.74, 0.69)` : ""}`,
                        position: "fixed",
                        left: 'calc(50vw - 100px)',
                        zIndex: 1000,
                        display: "flex",
                        justifyContent: "space-around",
                        alignItems: "center",
                        overflow: "hidden",
                        ...(useDefaultStyle ? defaulNotificationsStyle.QuickPopupStyle.notificationContainer : null),
                        ...notificationsStyle?.QuickPopupStyle?.notificationContainer
                    } },
                    React.createElement("p", { style: { ...(useDefaultStyle ? defaulNotificationsStyle.QuickPopupStyle.emojiText : null), ...notificationsStyle?.QuickPopupStyle?.emojiText } }, Notification.emoji),
                    React.createElement("p", { style: { ...(useDefaultStyle ? defaulNotificationsStyle.QuickPopupStyle.messageText : null), ...notificationsStyle?.QuickPopupStyle?.messageText } }, Notification.message)));
                break;
        }
        return notifComponent;
    });
    return (React.createElement(NotificationContext.Provider, { value: { notifications, addNotification } },
        React.createElement("style", null, css),
        notifications.map((notif) => {
            return React.createElement(NotificationComponent, { key: notif.id, Notification: notif });
        }),
        children));
}
const _ = {
    NotificationsProvider,
    NotificationContext,
    useNotification
};
export default _;
//# sourceMappingURL=index.js.map