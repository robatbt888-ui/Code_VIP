import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconName = ComponentProps<typeof MaterialIcons>["name"];
const MAPPING: Record<string, IconName> = {
  "house.fill": "home",
  "message.fill": "chat-bubble-outline",
  "folder.fill": "folder-open",
  "gearshape.fill": "settings",
  "paperplane.fill": "send",
  "plus": "add",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "sparkles": "auto-awesome",
  "copy": "content-copy",
  "trash": "delete-outline",
  "key": "vpn-key",
  "cloud": "cloud",
  "lock": "lock-outline",
  "arrow.up": "arrow-upward",
  "close": "close",
  "check": "check",
  "info": "info-outline",
};

export function IconSymbol({ name, size = 24, color, style, weight }: { name: keyof typeof MAPPING | string; size?: number; color: string | OpaqueColorValue; style?: StyleProp<TextStyle>; weight?: string }) {
  const icon = MAPPING[name] ?? "help-outline";
  return <MaterialIcons color={color} size={size} name={icon} style={style} />;
}
