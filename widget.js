const alertEl = document.querySelector(".ac-alert");
const headerEl = document.querySelector(".alert-header");
const messageEl = document.querySelector(".alert-message");

const logoEl = document.querySelector(".ac-logo");
const logoRingEl = document.querySelector(".ac-logo-ring");
const logoFlashEl = document.querySelector(".ac-logo-flash");

const dividerEl = document.querySelector(".ac-divider-glow");
const progressEl = document.querySelector(".ac-progress-fill");

const segmentEls = document.querySelectorAll(".ac-segments span");
const cornerEls = document.querySelectorAll(".ac-corner");

const footerEl = document.querySelector(".ac-footer");
const eventCodeEl = document.querySelector(".ac-event-code");
const scanEl = document.querySelector(".ac-scan");

let hideTimer;
let activeAnimations = [];

window.addEventListener("onEventReceived", function (obj) {
  const listener = obj.detail.listener;
  const data = obj.detail.event || {};

  const name = data.name || data.sender || "New Raider";
  const amount = Number(data.amount) || 1;

  if (listener === "follower-latest") {
    setAlert(
      "NEW RAIDER",
      `Welcome aboard, <span id="username">${name}</span>!`,
      "follow",
      "FLW-001"
    );
    return;
  }

  if (listener === "subscriber-latest") {
    if (data.bulkGifted || data.gifted) {
      const gifter = data.sender || name;

      setAlert(
        "SUPPLY DROP",
        `<span id="username">${gifter}</span> deployed ${amount} supply drop${amount === 1 ? "" : "s"}!`,
        "gift",
        "GFT-001"
      );
    } else {
      setAlert(
        "CREW MEMBER",
        `<span id="username">${name}</span> joined the crew!`,
        "sub",
        "SUB-001"
      );
    }

    return;
  }

  if (listener === "subscriber-gifted-latest") {
    setAlert(
      "SUPPLY DROP",
      `<span id="username">${name}</span> deployed ${amount} supply drop${amount === 1 ? "" : "s"}!`,
      "gift",
      "GFT-001"
    );
    return;
  }

  if (listener === "raid-latest") {
    setAlert(
      "REINFORCEMENTS ARRIVED",
      `<span id="username">${name}</span> arrived with ${amount} raider${amount === 1 ? "" : "s"}!`,
      "raid",
      "RAD-001"
    );
    return;
  }

  if (listener === "tip-latest") {
    setAlert(
      "MISSION SUPPORT",
      `<span id="username">${name}</span> supported the mission!`,
      "tip",
      "TIP-001"
    );
    return;
  }

  if (listener === "cheer-latest") {
    setAlert(
      "INTEL RECEIVED",
      `<span id="username">${name}</span> sent ${amount} bits!`,
      "bits",
      "BIT-001"
    );
  }
});

function setAlert(
  header,
  message,
  type = "follow",
  code = "FLW-001"
) {
  alertEl.dataset.type = type;
  headerEl.textContent = header;
  messageEl.innerHTML = message;
  eventCodeEl.textContent = code;

  playAlert(type);
}

function stopAnimations() {
  clearTimeout(hideTimer);

  activeAnimations.forEach((animation) => {
    try {
      animation.cancel();
    } catch (error) {
      console.warn("Animation cancel failed:", error);
    }
  });

  activeAnimations = [];
}

function animateElement(element, keyframes, options) {
  if (!element) {
    return null;
  }

  const animation = element.animate(keyframes, options);
  activeAnimations.push(animation);

  return animation;
}

function flashElement(
  element,
  delay,
  brightness = 2,
  duration = 280
) {
  if (!element) {
    return;
  }

  animateElement(
    element,
    [
      {
        filter: "brightness(1)",
        textShadow: "0 0 0 rgba(255,255,255,0)"
      },
      {
        filter: `brightness(${brightness})`,
        textShadow: "0 0 12px rgba(225,235,245,.7)",
        offset: 0.45
      },
      {
        filter: "brightness(1)",
        textShadow: "0 0 0 rgba(255,255,255,0)"
      }
    ],
    {
      duration,
      delay,
      fill: "forwards",
      easing: "ease-out"
    }
  );
}

function getCornerStartTransform(corner) {
  if (corner.classList.contains("ac-corner-tl")) {
    return "translate(12px, 12px)";
  }

  if (corner.classList.contains("ac-corner-tr")) {
    return "translate(-12px, 12px)";
  }

  if (corner.classList.contains("ac-corner-bl")) {
    return "translate(12px, -12px)";
  }

  return "translate(-12px, -12px)";
}

function resetAlert() {
  alertEl.style.opacity = "0";
  alertEl.style.transform =
    "translateY(-12px) scale(0.985)";

  headerEl.style.opacity = "0";
  headerEl.style.transform = "translateY(8px)";
  headerEl.style.filter = "brightness(1)";
  headerEl.style.textShadow =
    "0 0 0 rgba(255,255,255,0)";

  messageEl.style.opacity = "0";
  messageEl.style.transform = "translateY(8px)";
  messageEl.style.filter = "brightness(1)";
  messageEl.style.textShadow =
    "0 0 0 rgba(255,255,255,0)";

  logoEl.style.opacity = "0";
  logoEl.style.transform = "scale(0.82)";
  logoEl.style.filter = "brightness(0.65)";

  logoRingEl.style.opacity = "0";
  logoRingEl.style.transform =
    "scale(0.72) rotate(-20deg)";

  logoFlashEl.style.opacity = "0";
  logoFlashEl.style.transform = "scale(0.4)";

  dividerEl.style.transform = "translateX(-220%)";
  dividerEl.style.filter = "brightness(1)";

  progressEl.style.transformOrigin = "left center";
  progressEl.style.transform = "scaleX(0)";
  progressEl.style.filter = "brightness(1)";

  footerEl.style.opacity = "0";
  footerEl.style.transform = "translateY(5px)";

  eventCodeEl.style.opacity = "0";

  scanEl.style.opacity = "0";
  scanEl.style.transform =
    "translateX(0) skewX(-18deg)";

  segmentEls.forEach((segment) => {
    const isLeft = segment.closest(
      ".ac-segments-left"
    );

    segment.style.opacity = "0";
    segment.style.transformOrigin = isLeft
      ? "right center"
      : "left center";
    segment.style.transform = "scaleX(0)";
  });

  cornerEls.forEach((corner) => {
    corner.style.opacity = "0";
    corner.style.transform =
      getCornerStartTransform(corner);
  });
}

function playAlert(type) {
  stopAnimations();
  resetAlert();

  const isRaid = type === "raid";
  const isGift = type === "gift";
  const usernameEl =
    messageEl.querySelector("#username");

  animateElement(
    alertEl,
    [
      {
        opacity: 0,
        transform:
          "translateY(-12px) scale(0.985)"
      },
      {
        opacity: 1,
        transform: "translateY(0) scale(1)"
      }
    ],
    {
      duration: 420,
      fill: "forwards",
      easing: "cubic-bezier(.2,.75,.2,1)"
    }
  );

  segmentEls.forEach((segment, index) => {
    const isLeft = segment.closest(
      ".ac-segments-left"
    );

    animateElement(
      segment,
      [
        {
          opacity: 0,
          transform: isLeft
            ? "translateX(18px) scaleX(0)"
            : "translateX(-18px) scaleX(0)"
        },
        {
          opacity: 1,
          transform: isLeft
            ? "translateX(-3px) scaleX(1.08)"
            : "translateX(3px) scaleX(1.08)",
          offset: 0.75
        },
        {
          opacity: 1,
          transform: "translateX(0) scaleX(1)"
        }
      ],
      {
        duration: 520,
        delay: 140 + index * 55,
        easing: "cubic-bezier(.2,.8,.2,1)",
        fill: "forwards"
      }
    );
  });

  cornerEls.forEach((corner) => {
    const startTransform =
      getCornerStartTransform(corner);

    animateElement(
      corner,
      [
        {
          opacity: 0,
          transform: startTransform
        },
        {
          opacity: 1,
          transform: "translate(2px, 2px)",
          offset: 0.82
        },
        {
          opacity: 1,
          transform: "translate(0, 0)"
        }
      ],
      {
        duration: 420,
        delay: 260,
        easing: "cubic-bezier(.2,.85,.25,1)",
        fill: "forwards"
      }
    );
  });

  animateElement(
    logoRingEl,
    [
      {
        opacity: 0,
        transform:
          "scale(0.72) rotate(-20deg)"
      },
      {
        opacity: 1,
        transform:
          "scale(1.08) rotate(4deg)"
      },
      {
        opacity: 1,
        transform: "scale(1) rotate(0deg)"
      }
    ],
    {
      duration: isRaid ? 650 : 520,
      delay: 280,
      fill: "forwards",
      easing: "cubic-bezier(.2,.85,.25,1)"
    }
  );

  animateElement(
    logoEl,
    [
      {
        opacity: 0,
        transform: "scale(0.82)",
        filter: "brightness(0.65)"
      },
      {
        opacity: 1,
        transform: "scale(1.07)",
        filter: "brightness(2.2)",
        offset: 0.84
      },
      {
        opacity: 1,
        transform: "scale(1)",
        filter: "brightness(1)"
      }
    ],
    {
      duration: 500,
      delay: 340,
      fill: "forwards",
      easing: "cubic-bezier(.18,.85,.25,1)"
    }
  );

  animateElement(
    logoFlashEl,
    [
      {
        opacity: 0,
        transform: "scale(0.4)"
      },
      {
        opacity: 0.95,
        transform: "scale(1.15)",
        offset: 0.35
      },
      {
        opacity: 0,
        transform: "scale(1.7)"
      }
    ],
    {
      duration: 180,
      delay: 760,
      easing: "ease-out",
      fill: "forwards"
    }
  );

  animateElement(
    headerEl,
    [
      {
        opacity: 0,
        transform: "translateY(8px)",
        letterSpacing: "11px"
      },
      {
        opacity: 1,
        transform: "translateY(0)",
        letterSpacing: "7px"
      }
    ],
    {
      duration: 420,
      delay: 560,
      fill: "forwards",
      easing: "ease-out"
    }
  );

  animateElement(
    messageEl,
    [
      {
        opacity: 0,
        transform: "translateY(8px)"
      },
      {
        opacity: 1,
        transform: "translateY(0)"
      }
    ],
    {
      duration: 400,
      delay: 760,
      fill: "forwards",
      easing: "ease-out"
    }
  );

  /*
    SCANNER SWEEP

    The scanner now activates each section as it
    travels across the alert.
  */
  animateElement(
    scanEl,
    [
      {
        opacity: 0,
        transform:
          "translateX(0) skewX(-18deg)"
      },
      {
        opacity: isRaid ? 0.58 : 0.3,
        offset: 0.15
      },
      {
        opacity: isRaid ? 0.48 : 0.24,
        offset: 0.78
      },
      {
        opacity: 0,
        transform:
          "translateX(520%) skewX(-18deg)"
      }
    ],
    {
      duration: isRaid ? 1200 : 1000,
      delay: 900,
      fill: "forwards",
      easing: "linear"
    }
  );

  /*
    Scanner reaches the header.
  */
  flashElement(
    headerEl,
    1030,
    isRaid ? 2.35 : 1.9,
    300
  );

  /*
    Scanner reaches the username.
  */
  flashElement(
    usernameEl,
    1190,
    isRaid ? 2.6 : 2.15,
    320
  );

  /*
    Scanner catches the divider.
  */
  animateElement(
    dividerEl,
    [
      {
        transform: "translateX(-220%)",
        filter: "brightness(1)"
      },
      {
        filter: "brightness(2.4)",
        offset: 0.55
      },
      {
        transform: "translateX(430%)",
        filter: "brightness(1)"
      }
    ],
    {
      duration: 780,
      delay: 1120,
      fill: "forwards",
      easing: "cubic-bezier(.25,.7,.25,1)"
    }
  );

  animateElement(
    footerEl,
    [
      {
        opacity: 0,
        transform: "translateY(5px)"
      },
      {
        opacity: 1,
        transform: "translateY(0)"
      }
    ],
    {
      duration: 350,
      delay: 1320,
      fill: "forwards",
      easing: "ease-out"
    }
  );

  /*
    Scanner completes its read and begins progress.
  */
  animateElement(
    progressEl,
    [
      {
        transform: "scaleX(0)",
        filter: "brightness(1)"
      },
      {
        filter: "brightness(1.8)",
        offset: 0.18
      },
      {
        transform: "scaleX(1)",
        filter: "brightness(1)"
      }
    ],
    {
      duration: 900,
      delay: 1380,
      fill: "forwards",
      easing: "cubic-bezier(.2,.75,.2,1)"
    }
  );

  animateElement(
    eventCodeEl,
    [
      {
        opacity: 0
      },
      {
        opacity: 1
      }
    ],
    {
      duration: 300,
      delay: 1510,
      fill: "forwards",
      easing: "ease-out"
    }
  );

  if (isRaid || isGift) {
    const pulseCount = isRaid ? 2 : 1;

    for (let i = 0; i < pulseCount; i += 1) {
      animateElement(
        alertEl,
        [
          {
            boxShadow:
              "0 22px 60px rgba(0,0,0,.72), inset 0 1px 0 rgba(255,255,255,.09)"
          },
          {
            boxShadow:
              "0 22px 60px rgba(0,0,0,.72), 0 0 24px rgba(184,50,57,.35), inset 0 0 24px rgba(184,50,57,.1)"
          },
          {
            boxShadow:
              "0 22px 60px rgba(0,0,0,.72), inset 0 1px 0 rgba(255,255,255,.09)"
          }
        ],
        {
          duration: 520,
          delay: 1540 + i * 650,
          fill: "forwards",
          easing: "ease-in-out"
        }
      );
    }
  }

  hideTimer = setTimeout(() => {
    animateElement(
      alertEl,
      [
        {
          opacity: 1,
          transform: "translateY(0) scale(1)"
        },
        {
          opacity: 0,
          transform:
            "translateY(8px) scale(0.99)"
        }
      ],
      {
        duration: 500,
        fill: "forwards",
        easing: "ease-in"
      }
    );
  }, 6500);
}
