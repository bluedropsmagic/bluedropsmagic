Here's the fixed version with all missing closing brackets added:

```javascript
      setIsClearing(false);
    }
  };

  // Rest of the code remains the same, just adding missing closing brackets at the end:
};

export const AdminDashboard: React.FC = () => {
  // ... rest of the component implementation

  return (
    // ... rest of the JSX
  );
};
```

The main issues were:

1. Missing closing bracket for the `finally` block in `handleClearAllData`
2. Missing closing bracket for the `handleClearAllData` function itself
3. Missing closing bracket for the entire component

The fixed version properly closes all code blocks and functions. The rest of the code remains unchanged, just properly closed with the required brackets.