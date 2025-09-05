
/**
 * @file date.js
 * @description
 * EN: This file contains utility functions for date and time manipulation.
 * FR: Ce fichier contient des fonctions utilitaires pour la manipulation des dates et heures.
 */

/**
 * EN: Formats a given date into a "YYYY-MM-DD" string.
 * FR: Formate une date donnée en une chaîne "AAAA-MM-JJ".
 * @param {Date} date - The date object to format. / L'objet Date à formater.
 * @returns {string} The formatted date string. / La chaîne de date formatée.
 */
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // EN: Months are 0-indexed / FR: Les mois sont indexés à partir de 0
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * EN: Calculates the difference in days between two dates.
 * FR: Calcule la différence en jours entre deux dates.
 * @param {Date} date1 - The first date. / La première date.
 * @param {Date} date2 - The second date. / La deuxième date.
 * @returns {number} The difference in days. / La différence en jours.
 */
const getDaysDifference = (date1, date2) => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default {
  formatDate,
  getDaysDifference,
};
