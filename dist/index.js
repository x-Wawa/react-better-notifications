import React from "react";
export const NotificationContext = React.createContext({
    notifications: [],
    addNotification: () => { }
});
function buildNotificationByType(Notification) {
    let NotificationID = (Math.round(Math.random() * 1000) * (new Date().getTime()) * Math.random() * 1000);
    let deleteAt = new Date().getTime() + (Notification.duration || (Notification.type === "inbox" ? -1 : 2000));
    switch (Notification.type) {
        case "quickpopup":
            return {
                ...Notification,
                id: NotificationID,
                duration: Notification.duration || 2000,
                deleteAt
            };
        case "inbox":
            return {
                ...Notification,
                id: NotificationID,
                duration: Notification.duration || -1,
                deleteAt
            };
    }
}
const css = `
.quickPopupNotificationContainer {
  position: fixed;
  width: 250px;
  height: 70px;
  left: calc(50vw - 100px);
  z-index: 9999;
  background-color: aquamarine;
  border-radius: 25px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  overflow: hidden;
}

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

.inboxNotificationContainer {
  position: fixed;
  z-index: 90000;
  right: 30px;
  top: 100px;
  background-color: white;
  width: 250px;
  border-radius: 5px;
  animation: inboxSpawn 0.6s cubic-bezier(0.91, 0, 0.56, 0.99);
}

@keyframes inboxSpawn {
  0%   { right: -2000px; }
  70%  { right: 45px;    }
  80%  { right: 20px;    }
  90%  { right: 35px;    }
  100% { right: 30px;    }
}

@keyframes deleteInbox {
  0%   { right: 30px; }
  20%  { right: 20px; }
  30%  { right: 45px; }
  100% { right: -400px; display: none; }
}

.inboxTitleAndClosePart {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 9px;
  padding-left: 5px;
}

.inboxTitleText {
  font-weight: 600;
  font-size: 15px;
}

.inboxCloseButton, .inboxCloseButton::before {
  height: 15px;
  background-color: gray;
  width: 3px;
  border-radius: 5px;
}

.inboxCloseButtonBox {
  width: 20px;
  cursor: pointer;
  display: flex;
  justify-content: center;
}

.inboxCloseButton {
  transform: rotate(45deg);
}
.inboxCloseButton::before {
  display: block;
  content: "";
  transform: rotate(-90deg);
}

.inboxMessagePart {
  display: flex;
  align-items: center;
}

.inboxEmojiText {
  position: relative;
  font-size: 20px;
  margin-inline: 5px;
}

.inboxMessageText {
  font-size: 14px;
}

.inboxChoicesPart {
  height: 40px;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}

.inboxChoiceButton {
  height: 30px;
  padding-inline: 10px;
  border: none;
  border-radius: 10px;
  color: #FFF3F0;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.timeBarBeforeDeletion {
  height: 3px;
  width: 100%;
  animation: timeBarBeforeDeletion linear forwards;
}

@keyframes timeBarBeforeDeletion {
  0%   { width: 100%; }
  100% { width: 0%; }
}
`;
export function NotificationsProvider(props) {
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
        const InboxChoiceInputs = ({ actionButton, index }) => {
            const [hover0, setHover0] = React.useState(false);
            const [hover1, setHover1] = React.useState(false);
            return (React.createElement("input", { className: 'inboxChoiceButton', style: { backgroundColor: eval(`hover${index}`) ? actionButton.color_hover : actionButton.color }, onMouseEnter: () => { eval(`setHover${index}(true)`); }, onMouseLeave: () => { eval(`setHover${index}(false)`); }, type: "button", value: actionButton.case, onClick: () => { actionButton.callback; } }));
        };
        switch (Notification.type) {
            case "inbox":
                notifComponent = (React.createElement("div", { className: 'inboxNotificationContainer' },
                    React.createElement("div", { className: 'inboxTitleAndClosePart' },
                        React.createElement("p", { className: 'inboxTitleText' }, Notification.title),
                        React.createElement("div", { className: 'inboxCloseButtonBox', onClick: () => { removeNotification(Notification.id); } },
                            React.createElement("div", { className: 'inboxCloseButton' }))),
                    React.createElement("div", { className: 'inboxMessagePart' },
                        React.createElement("p", { className: 'inboxEmojiText' }, Notification.emoji),
                        React.createElement("p", { className: 'inboxMessageText' }, Notification.message)),
                    React.createElement("div", { className: 'inboxChoicesPart' }, Notification.actionButtons.map((actionButton, index) => {
                        return React.createElement(InboxChoiceInputs, { key: index, index: index, actionButton: actionButton });
                    })),
                    (Notification.duration > 0) ?
                        React.createElement("div", { className: 'timeBarBeforeDeletion', style: { animationDuration: `${((Notification.duration - 500) / 1000)}s`, backgroundColor: "#B32054" } })
                        : null));
                break;
            case "quickpopup":
                notifComponent = (React.createElement("div", { className: 'quickPopupNotificationContainer', style: { top: PopUpNotificationsArray.indexOf(Notification) * 80 + 10, animation: `quickPopupDespawn 0.3s linear ${(Notification.duration - 300) / 1000}s forwards, quickPopupGoUp 0.3s linear ${(PopUpNotificationsArray[0].deleteAt - new Date().getTime() - 300) / 1000}s forwards${(PopUpNotificationsArray.indexOf(Notification) === PopUpNotificationsArray.length - 1 && (Notification.deleteAt - new Date().getTime()) > 1900) ? `, quickPopupSpawn 0.2s cubic-bezier(1, 0.51, 0.74, 0.69)` : ""}` } },
                    React.createElement("p", null, Notification.emoji),
                    React.createElement("p", null, Notification.message)));
                break;
        }
        return notifComponent;
    });
    return (React.createElement(NotificationContext.Provider, { value: { notifications, addNotification } },
        React.createElement("style", null, css),
        notifications.map((notif) => {
            return React.createElement(NotificationComponent, { key: notif.id, Notification: notif });
        }),
        props.children));
}
const _ = {
    NotificationsProvider,
    NotificationContext
};
export default _;
//# sourceMappingURL=index.js.map