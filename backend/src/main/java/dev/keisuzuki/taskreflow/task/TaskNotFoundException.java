package dev.keisuzuki.taskreflow.task;

/**
 * 指定された ID のタスクが，そのユーザーのものとして存在しないときに投げる．
 * 他人のタスクを指定した場合も，存在しないものとして扱う．
 */
public class TaskNotFoundException extends RuntimeException {

    public TaskNotFoundException(long id) {
        super("タスクが見つかりません（id = " + id + "）");
    }
}
