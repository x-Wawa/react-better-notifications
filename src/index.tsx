import React from "react"


export interface NotificationsProps {
  type: "inbox" | "quickpopup";
  message: string;
}

export type NotificationProps = QuickPopupProps | InboxProps;

export type Notification = QuickPopupNotification | InboxNotification;

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

export interface NotificationChoices {
  case: string;
  callback: Function;
  color: string;
  color_hover: string;
}

export interface InboxProps extends NotificationsProps {
  type: "inbox";
  title: string;
  emoji: string;
  actionButtons: NotificationChoices[];
  duration?: number;
}

export interface InboxNotification extends InboxProps {
  id: number;
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

  let deleteAt = new Date().getTime() + (Notification.duration || (Notification.type === "inbox" ? -1 : 2000))

  switch(Notification.type) {
    case "quickpopup":
      return {
        ...Notification,
        id: NotificationID,
        duration: Notification.duration || 2000,
        deleteAt
      }
    case "inbox":
      return {
        ...Notification,
        id: NotificationID,
        duration: Notification.duration || -1,
        deleteAt
      }
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
`

export function NotificationsProvider(props: {children: React.ReactNode}): JSX.Element {

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
    
    const InboxChoiceInputs = ({actionButton, index}: {actionButton: NotificationChoices, index: number}): React.ReactElement => {

      const [hover0, setHover0] = React.useState(false)
      const [hover1, setHover1] = React.useState(false)


      return (
        <input
          className='inboxChoiceButton'
          style={{ backgroundColor: eval(`hover${index}`) ? actionButton.color_hover : actionButton.color }}
          onMouseEnter={() => { eval(`setHover${index}(true)`) }}
          onMouseLeave={() =>{ eval(`setHover${index}(false)`) }}
          type={"button"}
          value={actionButton.case}
          onClick={() => { actionButton.callback }}
        ></input>
      )
    }

    switch(Notification.type) {
      case "inbox":
        notifComponent = (
          <div className='inboxNotificationContainer'>
            <div className='inboxTitleAndClosePart'>
              <p className='inboxTitleText'>{Notification.title}</p>
              <div className='inboxCloseButtonBox' onClick={() => { removeNotification(Notification.id!) }}>
                <div className='inboxCloseButton'></div>
              </div>
            </div>
            <div className='inboxMessagePart'>
              <p className='inboxEmojiText'>{Notification.emoji}</p>
              <p className='inboxMessageText'>{Notification.message}</p>
            </div>
            <div className='inboxChoicesPart'>
              {
                Notification.actionButtons.map((actionButton, index) => {
                  return <InboxChoiceInputs key={index} index={index} actionButton={actionButton} />
                })
              }
            </div>
            {
              (Notification.duration > 0) ?
                <div className='timeBarBeforeDeletion' style={{ animationDuration: `${((Notification.duration! - 500) / 1000)}s`, backgroundColor: "#B32054" }}></div>
              : null
            }
          </div>
        )
        break;
      case "quickpopup":
        notifComponent = (
          <div className='quickPopupNotificationContainer' style={{ top: PopUpNotificationsArray.indexOf(Notification) * 80 + 10, animation: `quickPopupDespawn 0.3s linear ${(Notification.duration! - 300) / 1000}s forwards, quickPopupGoUp 0.3s linear ${(PopUpNotificationsArray[0].deleteAt! - new Date().getTime() - 300) / 1000}s forwards${(PopUpNotificationsArray.indexOf(Notification) === PopUpNotificationsArray.length - 1 && (Notification.deleteAt! - new Date().getTime()) > 1900) ? `, quickPopupSpawn 0.2s cubic-bezier(1, 0.51, 0.74, 0.69)` : ""}` }}>
            <p>{Notification.emoji}</p>
            <p>{Notification.message}</p>
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
      {props.children}
    </NotificationContext.Provider>
  );
}

const _ = {
  NotificationsProvider,
  NotificationContext
}

export default _;