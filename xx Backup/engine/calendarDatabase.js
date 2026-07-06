/**
 * ==========================================================
 * Paul's Calendar Engine
 * calendarDatabase.js
 *
 * This file is the ONLY source of astronomical truth.
 *
 * The engine NEVER calculates astronomy.
 *
 * ==========================================================
 */

import { parseDate } from "./dateUtils.js";

export const DATABASE = {

    2026:{

        springEquinox: parseDate("2026-03-20"),

        summerSolstice: parseDate("2026-06-20"),

        autumnEquinox: parseDate("2026-09-22"),

        winterSolstice: parseDate("2026-12-21"),

        fullMoons:[

            {
                number:1,
                name:"Renewal",
                date:parseDate("2026-04-01")
            },

          {
              number:2,
              name:"Flower",
              date:parseDate("2026-05-01")
          },
          {
              number:3,
              name:"Dance",
              date:parseDate("2026-05-31")
          },
          {
              number:4,
              name:"Water",
              date:parseDate("2026-06-29")
          },

        ]

    },

    2027:{

        springEquinox: parseDate("2027-03-20"),

        summerSolstice: parseDate("2027-06-21"),

        autumnEquinox: parseDate("2027-09-22"),

        winterSolstice: parseDate("2027-12-21"),

        fullMoons:[

            // We'll populate these together.

        ]

    }

};