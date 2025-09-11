  document.addEventListener("DOMContentLoaded", function () {
    // 1. Checagem de exibição anterior (via localStorage)
    const storageKey = `alreadyDisplayed`;
    const classToHide = DELAY_CONFIG.CLASS_TO_HIDE;
    const wasDisplayed =
      DELAY_CONFIG.USE_STORAGE &&
      localStorage.getItem(storageKey) === "true";

    if (wasDisplayed) {
      const elements = document.querySelectorAll(classToHide);
      elements.forEach((el) => {
        el.style.display = "flex";
      });
    }

    // 2. Inicializa player e aplica delays
    const player = document.querySelector("vturb-smartplayer");
    if (!player) {
      console.warn("Elemento <vturb-smartplayer> não encontrado.");
      return;
    }

    player.addEventListener("player:ready", function () {
      if (
        typeof DELAY_CONFIG !== "undefined" &&
        Array.isArray(DELAY_CONFIG.DELAYS)
      ) {
        DELAY_CONFIG.DELAYS.forEach(({ seconds, selector }) => {
          if (typeof player.displayHiddenElements === "function") {
            player.displayHiddenElements(seconds, [selector], {
              persist: DELAY_CONFIG.USE_STORAGE || false,
            });
          } else {
            console.warn("Método player.displayHiddenElements() não disponível.");
          }
        });
      } else {
        console.warn("DELAY_CONFIG.DELAYS não está definido corretamente.");
      }
    });

    // 3. Observa quando elementos ocultos forem exibidos
    const selectorsToWatch = DELAY_CONFIG.DELAYS.map((d) => d.selector);

    selectorsToWatch.forEach((selector) => {
      const elements = document.querySelectorAll(selector);

      elements.forEach((el) => {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (
              mutation.type === "attributes" &&
              (mutation.attributeName === "style" ||
                mutation.attributeName === "class")
            ) {
              const isVisible =
                window.getComputedStyle(el).display !== "none";

              if (isVisible) {
                console.log(`Elemento ${selector} foi exibido:`, el);

                // Marca como exibido no localStorage (apenas se ainda não estiver salvo)
                if (
                  DELAY_CONFIG.USE_STORAGE &&
                  !localStorage.getItem(storageKey)
                ) {
                  try {
                    localStorage.setItem(storageKey, "true");
                    document.querySelector('.stock-section').scrollIntoView({ behavior: 'smooth' });

                  } catch (e) {
                    console.warn("Erro ao salvar no localStorage:", e);
                  }
                }

                observer.disconnect(); // Para de observar após exibir
              }
            }
          });
        });

        observer.observe(el, {
          attributes: true,
          attributeFilter: ["style", "class"],
        });
      });
    });
  });