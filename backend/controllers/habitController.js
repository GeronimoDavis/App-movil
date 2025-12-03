
import Habit from '../models/habitModel.js';


export const createHabit = async (req, res) => {
    try{
        const {name, description, daysTarget} = req.body;
        const userId = req.user._id;

         if (!name || typeof name !== "string" || name.trim().length < 2) {//name.trim().length < 2 controla que existan letras y no espacios en blanco
            return res.status(400).json({ error: "Name must have at least 2 characters" });
        }
        if (name.length > 40) {
            return res.status(400).json({ error: "Name is too long (max 40 chars)" });
        }

        // Validación de description
        if (description && description.length > 300) {
            return res.status(400).json({ error: "Description too long (max 300 chars)" });
        }

        // Validación daysTarget
        if (daysTarget === undefined || daysTarget === null) {
            return res.status(400).json({ error: "daysTarget is required" });
        }
        if (typeof daysTarget !== "number" || !Number.isInteger(daysTarget) || daysTarget <= 0) {
            return res.status(400).json({ error: "daysTarget must be a positive integer" });
        }

        const newHabit = new Habit({
            name,
            description,
            daysTarget,
            startdate: Date.now(),
            startdatestreak: Date.now(),
            asset: true,
            userId: userId
        })
        await newHabit.save();
        res.status(201).json({ habit: newHabit, message: "Habit created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message, error: "Error creating habit" });
    }
       
};

export const getHabitsWithStreak = async (req, res) => {
    try{
        //tremos del req el id del usuario para buscar solo los habitos de ese usaurio
        const userId = req.user._id
        const habits = await Habit.find({userId});
        
        //calculo de la racha actual ya que esta no se guarda en la base de datos sino que se calcula al momento de pedir los habitos
        const habitsWithStreak = habits.map(habit => {
            const now = new Date();
            const StreakMs =  now - habit.startdatestreak;

            const days = Math.floor(StreakMs / (1000 * 60 * 60 * 24));//1000 * 60 * 60 * 24 = un dia en ms (86400000 ms) aca obtengo los dias de racha y descarto las horas y minutos
            const hours = Math.floor((StreakMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));// aca obtengo las horas restantes despues de sacar los dias
            const minutes = Math.floor((StreakMs % (1000 * 60 * 60)) / (1000 * 60));// aca obtengo los minutos restantes despues de sacar las horas
            return{
                ...habit._doc,// extraemos los datos del habit tal como estan en la base de datos
                currentStreak: {
                    days,
                    hours,
                    minutes
                }
            }
        });

        res.status(200).json({ habits: habitsWithStreak, message: "Habits retrieved successfully" });

        
    }catch (error) {
        res.status(500).json({ message: error.message, error: "Error retrieving habits" });
    }
    
};

export const getHabitwithStreakById = async (req, res) => {
    try{
        const {id} = req.params;// id del habito
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid habit ID" });
        }

        const userId = req.user._id;//id del usaurio logeado
        const habit = await Habit.findOne({_id: id, userId});
        if(!habit){
            return res.status(404).json({ message: "Habit not found", error: "Habit not found" });
        }

        const now = new Date();
        const StreakMs =  now - habit.startdatestreak;
        const days = Math.floor(StreakMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((StreakMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((StreakMs % (1000 * 60 * 60)) / (1000 * 60));

        return res.status(200).json({ habit: {...habit._doc,
            currentStreak: {
                days, 
                hours,
                minutes
        }}, message: "Habit retrieved successfully" });
    }catch (error) {
        res.status(500).json({ message: error.message, error: "Error retrieving habit" });
    }
}

export const getBestStreak = async (req, res) => {
    try{
        const {id} = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid habit ID" });
        }
        const userId = req.user.id;

        const habit = await Habit.findOne({ _id: id, userId });
        if(!habit){
            return res.status(404).json({ message: "Habit not found", error: "Habit not found" });
        }

        const bestStreakMs = habit.beststreak;
        const days = Math.floor(bestStreakMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((bestStreakMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((bestStreakMs % (1000 * 60 * 60)) / (1000 * 60));

        return res.status(200).json({ bestStreak: {
            days,
            hours,
            minutes
        }});
    }catch (error) {
        res.status(500).json({ message: error.message, error: "Error retrieving best streak" });
    }
}


export const lostStreak = async (req, res) => {
    try{
        const {id} = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid habit ID" });
        }
        const userId = req.user.id;

        const habit = await Habit.findOne({ _id: id, userId });
        if(!habit){
            return res.status(404).json({ message: "Habit not found", error: "Habit not found" });
        }

        const now = new Date();
        const currentStreakMs =  now - habit.startdatestreak;
        
        if(currentStreakMs > habit.beststreak){
            habit.beststreak = currentStreakMs;
        }

        habit.startdatestreak = now;
        habit.lastLossdate = now;

        await habit.save();
        res.status(200).json({ habit, message: "Reset streak successfully" });
    }catch (error) {
        res.status(500).json({ message: error.message, error: "Error updating habit streak" });
    }
};

export const deleteHabit = async (req, res) => {
    try{
        const {id} = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid habit ID" });
        }
        const habit = await Habit.findByIdAndDelete(id);
        if(!habit){
            return res.status(404).json({ message: "Habit not found", error: "Habit not found" });
        }
        res.status(200).json({ message: "Habit deleted successfully" });
    }catch (error) {
        res.status(500).json({ message: error.message, error: "Error deleting habit" });
    }
}


