package dev.keisuzuki.taskreflow.task;

import java.time.LocalDate;

/**
 * 取得する期間の指定が逆転しているときに投げる．
 */
public class InvalidDateRangeException extends RuntimeException {

    public InvalidDateRangeException(LocalDate from, LocalDate to) {
        super("期間の指定が逆です（from = " + from + " ， to = " + to + "）");
    }
}
