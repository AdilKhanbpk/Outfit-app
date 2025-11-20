import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import { ChromePicker, ColorResult } from "react-color";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { clothingOptions, ClothingCategory } from "@shared/schema";

interface ClothingItem {
  type: string;
  color: string;
}

interface ClothingSelectorProps {
  category: ClothingCategory;
  value: ClothingItem | undefined;
  onChange: (value: ClothingItem | undefined) => void;
  disabled?: boolean;
}

const categoryLabels: Record<ClothingCategory, string> = {
  shirt: "Shirt",
  pants: "Pants",
  shoes: "Shoes",
  coat: "Coat / Jacket",
  watch: "Watch",
};

export function ClothingSelector({
  category,
  value,
  onChange,
  disabled,
}: ClothingSelectorProps) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  const handleTypeChange = (type: string) => {
    if (type === "none") {
      onChange(undefined);
    } else {
      onChange({
        type,
        color: value?.color || "#000000",
      });
    }
  };

  const handleColorChange = (color: ColorResult) => {
    if (value) {
      onChange({
        ...value,
        color: color.hex,
      });
    }
  };

  const options = clothingOptions[category];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold font-heading">
          {categoryLabels[category]}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select
          value={value?.type || "none"}
          onValueChange={handleTypeChange}
          disabled={disabled}
        >
          <SelectTrigger
            className="w-full"
            data-testid={`select-${category}-type`}
          >
            <SelectValue placeholder={`Select ${categoryLabels[category].toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {value && (
          <div className="flex items-center gap-3">
            <Popover open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 justify-start gap-2"
                  disabled={disabled}
                  data-testid={`button-${category}-color`}
                >
                  <div
                    className="w-8 h-8 rounded border border-border"
                    style={{ backgroundColor: value.color }}
                  />
                  <span className="text-sm">{value.color.toUpperCase()}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <ChromePicker
                  color={value.color}
                  onChange={handleColorChange}
                  disableAlpha
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="icon"
              disabled={disabled}
              onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
              data-testid={`button-${category}-color-picker`}
            >
              <Palette className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
