'use strict';

class DelayLogic {

  /**
   * Returns wait time in second for given retry number.
   *
   * Returns longer delays as number of retries increases.
   * Visualization:
   * @see  https://docs.google.com/spreadsheets/d/1AECd5YrOXJnYlH7BW9wtPBL2Tqp5Wjd3c0VnYGqA780/edit?usp=sharing
   *
   * @param  {int} currentRetryNumber - Retry number
   * @return {int} Seconds to wait
   */
  static exponentialBackoff(currentRetryNumber) {
    // eslint-disable-next-line no-mixed-operators
    return ((currentRetryNumber ** 2) / 4 + 1) * 1000;
  }
}

module.exports = DelayLogic;
