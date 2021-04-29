import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';

import {
  NativeSelect as BaseSelect,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@material-ui/core';
import { useField } from '@unform/core';

import { SelectProps } from './types';

function getOptionsCollectionArray(
  options: HTMLOptionsCollection,
): HTMLOptionElement[] {
  const arr: HTMLOptionElement[] = [];
  for (let i = 0; i < options.length; i += 1) {
    arr.push(options[i]);
  }
  return arr;
}

const SelectInput: React.FC<SelectProps> = ({
  label,
  style,
  className,
  defaultValue,
  onChange,
  multiple,
  variant = 'outlined',
  inputProps,
  children,
  ...restProps
}) => {
  const {
    fieldName,
    registerField,
    defaultValue: defaultFieldValue,
    error,
  } = useField(inputProps.name);

  const inputRef = useRef(null);

  const defaultInputValue = useMemo(() => {
    if (multiple) {
      return defaultFieldValue || defaultValue || [];
    }
    return defaultFieldValue || defaultValue || '';
  }, [defaultFieldValue, defaultValue, multiple]);

  const [inputValue, setInputValue] = useState(defaultInputValue);

  const _handleChange = useCallback(
    event => {
      const element = event.target;

      let newValue: number | number[] | string | string[];

      if (multiple) {
        newValue = getOptionsCollectionArray(element.options)
          .filter(opt => opt.selected)
          .map(opt => opt.value);
      } else {
        newValue = element.value;
        setInputValue(() => newValue);

        if (newValue !== undefined && typeof onChange === 'function') {
          onChange(event);
        }
      }
    },
    [setInputValue, multiple, onChange],
  );

  useEffect(() => {
    if (fieldName) {
      registerField({
        name: fieldName,
        ref: inputRef.current,
        getValue() {
          return inputValue;
        },
        setValue(_, newValue: string | string[] | number[]) {
          _handleChange({
            target: { value: newValue },
          });
        },
      });
    }
  }, [fieldName, registerField, _handleChange, inputValue]);

  const baseSelectProps: SelectProps = useMemo(
    () => ({
      inputProps: {
        ...inputProps,
        ref: inputRef,
      },
      defaultValue: defaultInputValue || inputValue,
      onChange: _handleChange,
      multiple,
      ...restProps,
    }),
    [
      inputProps,
      inputValue,
      defaultInputValue,
      restProps,
      _handleChange,
      multiple,
    ],
  );

  // const shrink = useMemo<boolean>(() => {
  //   if (native) {
  //     return true;
  //   }

  //   if (multiple) {
  //     return !!(value || inputValue).length;
  //   }

  //   return !!value || !!inputValue;
  // }, [multiple, inputValue, value]);

  return (
    <FormControl
      style={{ minWidth: 400, ...style }}
      className={className}
      error={!!error}
      variant={variant}
    >
      {!!label && (
        <>
          <InputLabel htmlFor={inputProps.id}>{label}</InputLabel>
          {/* <InputLabel shrink={shrink} {...{ 'data-testid': 'select-label' }}>
           {label}
         </InputLabel> */}
        </>
      )}
      <BaseSelect variant={variant} {...baseSelectProps}>
        {children}
      </BaseSelect>

      {!!error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

export default React.memo(SelectInput);
