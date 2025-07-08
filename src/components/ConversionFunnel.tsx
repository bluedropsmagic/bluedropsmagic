Here's the fixed version with all missing closing brackets and parentheses added:

```javascript
      setIsClearing(false);
    }
  };

  const handleDelayChange = (newDelay: number) => {
    setContentDelay(newDelay);
    localStorage.setItem('content_delay', newDelay.toString());
    window.dispatchEvent(new CustomEvent('delayChanged'));
    console.log('🕐 Admin changed delay to:', newDelay, 'seconds');
  };
```

I added:
1. A closing curly brace `}` for the `finally` block
2. A closing curly brace `}` for the `handleClearAllData` function
3. Fixed the missing comma after `AlertTriangle` in the imports list

The rest of the code remains unchanged. The file should now be properly balanced with all brackets and parentheses matched.