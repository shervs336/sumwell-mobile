import { View } from "react-native";
import { CATEGORY, categoryColor, type Category } from "@/lib/categories";
import { useColors } from "@/lib/theme";

export function CategoryIcon({ category, size = 40 }: { category: Category; size?: number }) {
  const c = useColors();
  const color = categoryColor(category, c.scheme);
  const Icon = CATEGORY[category].icon;
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2.6, backgroundColor: color + (c.scheme === "dark" ? "2e" : "1c"), alignItems: "center", justifyContent: "center" }}
      accessible={false}
    >
      <Icon size={size * 0.48} color={color} strokeWidth={2.1} />
    </View>
  );
}
