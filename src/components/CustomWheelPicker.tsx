// src/components/CustomWheelPicker.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ListRenderItemInfo,
} from 'react-native';

interface Props {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  itemHeight?: number;
  height?: number;
  containerStyle?: any;
  selectedIndicatorStyle?: any;
  itemTextStyle?: any;
  selectedItemTextStyle?: any;
}

const CustomWheelPicker: React.FC<Props> = ({
  options,
  selectedIndex,
  onChange,
  itemHeight = 50,
  height = 200,
  containerStyle,
  selectedIndicatorStyle,
  itemTextStyle,
  selectedItemTextStyle,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const [selected, setSelected] = useState(selectedIndex);
  const [isMounted, setIsMounted] = useState(false);

  // 计算可视区域中间偏移量
  const getOffset = (index: number) => index * itemHeight;

  // 滚动到指定索引
  const scrollToIndex = (index: number, animated = true) => {
    const offset = getOffset(index);
    flatListRef.current?.scrollToOffset({ offset, animated });
  };

  // 初始化定位
  useEffect(() => {
    setIsMounted(true);
    setTimeout(() => {
      scrollToIndex(selectedIndex, false);
    }, 20);
  }, []);

  // 当 selectedIndex 变化时（外部控制），滚动到新位置
  useEffect(() => {
    if (isMounted && selectedIndex !== selected) {
      setSelected(selectedIndex);
      scrollToIndex(selectedIndex);
    }
  }, [selectedIndex]);

  // 滚动结束后计算当前选中索引
  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / itemHeight);
    const clampedIndex = Math.max(0, Math.min(index, options.length - 1));
    if (clampedIndex !== selected) {
      setSelected(clampedIndex);
      onChange(clampedIndex);
    }
    // 对齐到整数倍
    scrollToIndex(clampedIndex);
  };

  // 滚动减速时更新（可选）
  const onScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // 可做更精细的处理，但 momentum 已经足够
  };

  // 渲染每一项
  const renderItem = ({ item, index }: ListRenderItemInfo<string>) => {
    const isSelected = index === selected;
    return (
      <View style={{ height: itemHeight, justifyContent: 'center', alignItems: 'center' }}>
        <Text
          style={[
            styles.defaultItemText,
            itemTextStyle,
            isSelected && styles.defaultSelectedText,
            isSelected && selectedItemTextStyle,
          ]}
        >
          {item}
        </Text>
      </View>
    );
  };

  // 获取 key
  const keyExtractor = (_: string, index: number) => index.toString();

  return (
    <View style={[styles.container, { height }, containerStyle]}>
      <FlatList
        ref={flatListRef}
        data={options}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollEndDrag={onScrollEndDrag}
        getItemLayout={(_, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
        initialScrollIndex={selectedIndex}
        contentContainerStyle={{
          paddingTop: height / 2 - itemHeight / 2,
          paddingBottom: height / 2 - itemHeight / 2,
        }}
      />
      {/* 选择器指示器（半透明背景条） */}
      <View
        style={[
          styles.selectedIndicator,
          {
            height: itemHeight,
            top: height / 2 - itemHeight / 2,
          },
          selectedIndicatorStyle,
        ]}
        pointerEvents="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  selectedIndicator: {
    position: 'absolute',
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    borderRadius: 6,
  },
  defaultItemText: {
    fontSize: 18,
    color: '#333',
  },
  defaultSelectedText: {
    fontSize: 22,
    color: '#007AFF',
    fontWeight: '700',
  },
});

export default CustomWheelPicker;