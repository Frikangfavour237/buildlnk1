import DateTimePicker from "@react-native-community/datetimepicker";
import { View } from "react-native";

export default function DatePicker({ value, onChange, minimumDate }) {
  const today = new Date();

  return (
    <View>
      <DateTimePicker
        mode="date"
        display="default"
        value={value instanceof Date ? value : new Date()}
        minimumDate={minimumDate || today}
        onChange={onChange}
      />
    </View>
  );
}
