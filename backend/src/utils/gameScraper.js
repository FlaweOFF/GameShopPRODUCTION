// backend/utils/gameScraper.js
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Преобразует дату из формата "4.4.2025 10:59 PM UTC" в формат "DD.MM.YYYY HH:mm GMT+3"
 * @param {string} dateStr - Строка с датой в формате "4.4.2025 10:59 PM UTC"
 * @returns {string} - Дата в формате "DD.MM.YYYY HH:mm GMT+3"
 */
const formatDiscountEndDate = (dateStr) => {
  if (!dateStr) return '';
  
  try {
    // Разбиваем строку даты на компоненты
    const dateParts = dateStr.split(' ');
    if (dateParts.length < 3) return dateStr;
    
    // Получаем компоненты даты
    const datePart = dateParts[0]; // "4.4.2025"
    const timePart = dateParts[1]; // "10:59"
    const ampmPart = dateParts[2]; // "PM"
    
    // Парсим дату
    const [day, month, year] = datePart.split('.').map(Number);
    
    // Парсим время
    let [hours, minutes] = timePart.split(':').map(Number);
    
    // Преобразуем 12-часовой формат в 24-часовой
    if (ampmPart.toUpperCase() === 'PM' && hours < 12) {
      hours += 12;
    } else if (ampmPart.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }
    
    // Форматируем в требуемый формат "DD.MM.YYYY HH:mm GMT+3"
    return `${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${year} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} GMT+3`;
  } catch (error) {
    console.error('Ошибка при форматировании даты окончания скидки:', error);
    return dateStr; // Возвращаем исходную строку в случае ошибки
  }
};

/**
 * Извлекает год из строки даты формата DD.MM.YYYY
 * @param {string} dateStr - Строка с датой в формате "DD.MM.YYYY"
 * @returns {string} - Только год (YYYY)
 */
const extractYearFromDate = (dateStr) => {
  if (!dateStr) return '';
  
  try {
    // Разбиваем строку даты на компоненты
    const [day, month, year] = dateStr.split('.');
    return year || ''; // Возвращаем только год
  } catch (error) {
    console.error('Ошибка при извлечении года из даты:', error);
    return '';
  }
};

/**
 * Парсит бэкграунд изображение для игры
 * @param {*} $ - Объект cheerio
 * @returns {string} - URL бэкграунд изображения
 */
const parseBackgroundImage = ($) => {
  try {
    // Ищем изображение для бэкграунда согласно указанному селектору в задании
    const backgroundImageElement = $('img[data-qa="gameBackgroundImage#heroImage#image"]');
    
    // Выводим отладочную информацию о найденном элементе
    console.log('Найден элемент фона:', backgroundImageElement.length > 0 ? 'Да' : 'Нет');
    
    if (backgroundImageElement.length > 0) {
      // Получаем значение атрибута src
      let backgroundImageSrc = backgroundImageElement.attr('src');
      console.log('Атрибут src фона:', backgroundImageSrc);
      
      // Если изображение найдено через src, используем его
      if (backgroundImageSrc) {
        // Проверяем наличие параметров размера в URL и устанавливаем параметр w=1920
        if (backgroundImageSrc.includes('?')) {
          const baseUrlParts = backgroundImageSrc.split('?');
          const baseUrl = baseUrlParts[0];
          const params = new URLSearchParams(baseUrlParts[1]);
          
          // Устанавливаем размер 1920px для лучшего качества
          params.set('w', '1920');
          
          // Собираем URL обратно
          backgroundImageSrc = `${baseUrl}?${params.toString()}`;
        } else {
          // Если нет параметров, добавляем размер
          backgroundImageSrc = `${backgroundImageSrc}?w=1920`;
        }
        
        console.log('Итоговый URL фона:', backgroundImageSrc);
        return backgroundImageSrc;
      }
      
      // Если src не найден, пробуем srcset
      const srcSet = backgroundImageElement.attr('srcset');
      console.log('Атрибут srcset фона:', srcSet);
      
      if (srcSet) {
        // Извлекаем первый URL из srcset (обычно формат: "url1 1x, url2 2x")
        const srcSetParts = srcSet.split(',');
        
        // Ищем URL с параметром w=1920 или первый доступный
        let bestUrl = '';
        for (const part of srcSetParts) {
          const urlPart = part.trim().split(' ')[0];
          if (urlPart && urlPart.includes('w=1920')) {
            bestUrl = urlPart;
            break;
          } else if (!bestUrl && urlPart) {
            bestUrl = urlPart;
          }
        }
        
        if (bestUrl) {
          // Проверяем, нужно ли добавить параметр w=1920
          if (!bestUrl.includes('w=')) {
            bestUrl = bestUrl.includes('?') ? 
              `${bestUrl}&w=1920` : 
              `${bestUrl}?w=1920`;
          }
          
          console.log('URL из srcset:', bestUrl);
          return bestUrl;
        }
      }
    }
    
    // Пробуем альтернативные селекторы, если основной не сработал
    const alternativeSelectors = [
      'img.psw-fill-x.psw-l-fit-contain',
      'img.psw-image.psw-fill-x.psw-l-fit-contain',
      'img.psw-l-fit-cover',
      'img.psw-right-top-third'
    ];
    
    for (const selector of alternativeSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        const src = element.attr('src');
        const srcset = element.attr('srcset');
        
        if (src) {
          console.log('Найден альтернативный элемент с src:', src);
          return src.includes('?') ? 
            src.replace(/\?.*$/, '?w=1920') : 
            `${src}?w=1920`;
        } else if (srcset) {
          const firstUrl = srcset.split(',')[0].trim().split(' ')[0];
          if (firstUrl) {
            console.log('Найден альтернативный элемент с srcset:', firstUrl);
            return firstUrl.includes('?') ? 
              firstUrl.replace(/\?.*$/, '?w=1920') : 
              `${firstUrl}?w=1920`;
          }
        }
      }
    }
    
    console.log('Фоновое изображение не найдено');
    return '';
  } catch (error) {
    console.error('Ошибка при получении бэкграунд-изображения:', error);
    return '';
  }
};

/**
 * Определяет, поддерживает ли игра PS4, PS5 или обе платформы
 * @param {*} $ - Объект cheerio
 * @returns {Object} - Объект с информацией о поддерживаемых платформах
 */
const determineSupportedPlatforms = ($) => {
  // Получаем данные о платформе
  const platformElement = $('[data-qa="gameInfo#releaseInformation#platform-value"]');
  const platformText = platformElement.length ? platformElement.text().trim() : '';
  
  let supportsPS4 = false;
  let supportsPS5 = false;
  
  // Определяем какие платформы поддерживаются
  if (platformText) {
    supportsPS4 = platformText.includes('PS4');
    supportsPS5 = platformText.includes('PS5');
    
    // Если указана только PS4, предполагаем что игра также работает на PS5 по обратной совместимости
    if (supportsPS4 && !supportsPS5) {
      supportsPS5 = true;
    }
  } else {
    // Если платформы не найдены, предполагаем обе платформы по умолчанию
    supportsPS4 = true;
    supportsPS5 = true;
  }
  
  return { supportsPS4, supportsPS5 };
};

/**
 * Парсит данные о языковой поддержке
 * @param {*} $ - Объект cheerio
 * @param {Object} supportedPlatforms - Объект с информацией о поддерживаемых платформах
 * @returns {Object} - Объект с языковыми данными
 */
const parseLanguageSupport = ($, supportedPlatforms) => {
  try {
    const { supportsPS4, supportsPS5 } = supportedPlatforms;
    
    // Языковая поддержка по умолчанию
    const languageSupport = {
      voicePS5: '',
      voicePS4: '',
      subtitlesPS5: '',
      subtitlesPS4: ''
    };
    
    console.log('Начало парсинга языковой поддержки');
    
    // Новые селекторы для языковой поддержки
    const voiceElement = $('[data-qa="gameInfo#releaseInformation#voice-value"]');
    const subtitlesElement = $('[data-qa="gameInfo#releaseInformation#subtitles-value"]');
    
    // Альтернативные селекторы (старые)
    const voicePS5Element = $('[data-qa="gameInfo#releaseInformation#ps5Voice-value"]');
    const voicePS4Element = $('[data-qa="gameInfo#releaseInformation#ps4Voice-value"]');
    const subtitlesPS5Element = $('[data-qa="gameInfo#releaseInformation#ps5Subtitles-value"]');
    const subtitlesPS4Element = $('[data-qa="gameInfo#releaseInformation#ps4Subtitles-value"]');
    
    // Проверяем наличие общих селекторов голоса
    if (voiceElement.length) {
      const voiceText = voiceElement.text().trim();
      console.log('Найден голос:', voiceText);
      
      // Заполняем данные только для тех платформ, которые поддерживает игра
      if (supportsPS5) {
        languageSupport.voicePS5 = voiceText;
      }
      
      if (supportsPS4) {
        languageSupport.voicePS4 = voiceText;
      }
    }
    
    // Проверяем наличие общих селекторов субтитров
    if (subtitlesElement.length) {
      const subtitlesText = subtitlesElement.text().trim();
      console.log('Найдены субтитры:', subtitlesText);
      
      // Заполняем данные только для тех платформ, которые поддерживает игра
      if (supportsPS5) {
        languageSupport.subtitlesPS5 = subtitlesText;
      }
      
      if (supportsPS4) {
        languageSupport.subtitlesPS4 = subtitlesText;
      }
    }
    
    // Проверяем старые селекторы только если новые не сработали
    if (supportsPS5 && !languageSupport.voicePS5 && voicePS5Element.length) {
      languageSupport.voicePS5 = voicePS5Element.text().trim();
    }
    
    if (supportsPS4 && !languageSupport.voicePS4 && voicePS4Element.length) {
      languageSupport.voicePS4 = voicePS4Element.text().trim();
    }
    
    if (supportsPS5 && !languageSupport.subtitlesPS5 && subtitlesPS5Element.length) {
      languageSupport.subtitlesPS5 = subtitlesPS5Element.text().trim();
    }
    
    if (supportsPS4 && !languageSupport.subtitlesPS4 && subtitlesPS4Element.length) {
      languageSupport.subtitlesPS4 = subtitlesPS4Element.text().trim();
    }
    
    console.log('Результат парсинга языковой поддержки:', languageSupport);
    return languageSupport;
  } catch (error) {
    console.error('Ошибка при получении данных о языковой поддержке:', error);
    return {
      voicePS5: '',
      voicePS4: '',
      subtitlesPS5: '',
      subtitlesPS4: ''
    };
  }
};

const fetchGameData = async (gameUrl) => {
  try {
    // Check if URL is valid
    if (!gameUrl.includes('store.playstation.com')) {
      throw new Error('Invalid PlayStation Store URL');
    }

    const response = await axios.get(gameUrl);
    const $ = cheerio.load(response.data);

    // Extract game title
    const title = $('h1.psw-m-b-5').text().trim();
    if (!title) {
      throw new Error('Game title not found');
    }

    // Extract price information
    let discountPrice = '';
    let originalPrice = '';
    let discountPercentage = '';
    let discountEndDate = '';

    // Find the price section
    const priceContainer = $('.psw-fill-x.psw-l-stack-left');
    
    // Extract discount price
    discountPrice = priceContainer.find('[data-qa="mfeCtaMain#offer0#finalPrice"]').text().trim();
    
    // Extract original price
    originalPrice = priceContainer.find('[data-qa="mfeCtaMain#offer0#originalPrice"]').text().trim();
    
    // Extract discount percentage
    discountPercentage = priceContainer.find('[data-qa="mfeCtaMain#offer0#discountInfo"]').text().trim();
    
    // Extract discount end date
    let rawDiscountEndDate = priceContainer.find('[data-qa="mfeCtaMain#offer0#discountDescriptor"]').text().trim();
    // Форматируем дату окончания скидки
    discountEndDate = formatDiscountEndDate(rawDiscountEndDate.replace('Предложение заканчивается ', '').trim());
    
    // Clean price values (remove currency and convert to number)
    const cleanDiscountPrice = parseFloat(discountPrice.replace(/[^\d.,]/g, '').replace(',', '.'));
    const cleanOriginalPrice = parseFloat(originalPrice.replace(/[^\d.,]/g, '').replace(',', '.'));
    
    // If no discount found, use original price for both
    const finalDiscountPrice = !isNaN(cleanDiscountPrice) ? cleanDiscountPrice : cleanOriginalPrice;
    const finalOriginalPrice = !isNaN(cleanOriginalPrice) ? cleanOriginalPrice : finalDiscountPrice;

    // Extract game description
    const fullDescription = $('[data-qa="mfe-game-overview#description"]').text().trim();
    
    // Extract only the first paragraph of the description
    const shortDescription = fullDescription.split('<br>')[0] || fullDescription.substring(0, 300);
    
    // Получаем бэкграунд-изображение
    const backgroundImageUrl = parseBackgroundImage($);
    console.log('Найденный URL бэкграунда:', backgroundImageUrl);
    
    // Определяем поддерживаемые платформы
    const supportedPlatforms = determineSupportedPlatforms($);
    const { supportsPS4, supportsPS5 } = supportedPlatforms;
    
    // Формируем строку с поддерживаемыми платформами
    let platformSupportStr = [];
    if (supportsPS5) platformSupportStr.push('PS5');
    if (supportsPS4) platformSupportStr.push('PS4');
    const platformSupport = platformSupportStr.join(', ');
    
    console.log('Поддерживаемые платформы:', platformSupport);
    
    // Получаем информацию о дате выпуска
    const releaseDateElement = $('[data-qa="gameInfo#releaseInformation#releaseDate-value"]');
    const releaseDate = releaseDateElement.length ? releaseDateElement.text().trim() : '';
    const releaseYear = extractYearFromDate(releaseDate);

    // Получаем данные о языковой поддержке с учетом поддерживаемых платформ
    const languageSupport = parseLanguageSupport($, supportedPlatforms);
    
    // Ищем JSON-LD данные продукта, содержащие SKU
    let sku = '';
    let imageUrl = '';
    
    try {
      // Ищем скрипт с JSON-LD данными
      const scriptContent = $('script[type="application/ld+json"]').html();
      if (scriptContent) {
        const productData = JSON.parse(scriptContent);
        
        // Получаем SKU из данных продукта
        if (productData.sku) {
          sku = productData.sku;
          
          // Формируем URL изображения на основе SKU
          imageUrl = `https://store.playstation.com/store/api/chihiro/00_09_000/container/UA/ru/99/${sku}/0/image?_version=00_09_000&platform=chihiro&bg_color=000000&opacity=100&w=336&h=336`;
        } else if (productData.image) {
          // Если SKU нет, но есть прямая ссылка на изображение
          imageUrl = productData.image;
        }
      }
    } catch (error) {
      console.error('Ошибка при извлечении данных JSON-LD:', error);
    }
    
    // Если не удалось получить изображение через JSON-LD, пробуем через теги img
    if (!imageUrl) {
      imageUrl = $('img.psw-fill-x.psw-l-fit-contain').attr('src') || 
                 $('img.psw-image.psw-fill-x.psw-l-fit-contain').attr('src');
    }
    
    // Extract genres - используем обновленный селектор для жанров
    const genres = [];
    const genresElement = $('[data-qa="gameInfo#releaseInformation#genre-value"]');
    
    if (genresElement.length) {
      const genresText = genresElement.text().trim();
      if (genresText) {
        // Получаем жанры из span с капитализацией (как в примере)
        genresElement.find('span[style="text-transform: capitalize;"]').each((i, el) => {
          genres.push($(el).text().trim());
        });
        
        // Если не нашли через span, пытаемся разделить текст
        if (genres.length === 0 && genresText) {
          genresText.split(',').forEach(genre => {
            const trimmedGenre = genre.trim();
            if (trimmedGenre) genres.push(trimmedGenre);
          });
        }
      }
    }

    // Подготовка объекта с данными игры
    const gameData = {
      title,
      imageUrl,
      backgroundImageUrl,
      originalPrice: finalOriginalPrice,
      discountPrice: finalDiscountPrice,
      discountPercentage: discountPercentage.replace('Сэкономьте ', '').trim(),
      discountEndDate: discountEndDate,
      fullDescription,
      shortDescription,
      genres,
      releaseDate,
      releaseYear,
      platformSupport,
      sku
    };
    
    // Добавляем языковую поддержку только для поддерживаемых платформ
    if (supportsPS5) {
      gameData.voicePS5 = languageSupport.voicePS5;
      gameData.subtitlesPS5 = languageSupport.subtitlesPS5;
    }
    
    if (supportsPS4) {
      gameData.voicePS4 = languageSupport.voicePS4;
      gameData.subtitlesPS4 = languageSupport.subtitlesPS4;
    }
    
    return gameData;
  } catch (error) {
    console.error('Error fetching game data:', error);
    throw new Error('Failed to fetch game data: ' + error.message);
  }
};

module.exports = { fetchGameData };